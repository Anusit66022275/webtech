require('dotenv').config();

const express    = require('express');
const path       = require('path');
const mysql      = require('mysql');
const cookieParser = require('cookie-parser');
const session    = require('express-session');
const flash      = require('connect-flash');
const multer     = require('multer');
const bcrypt     = require('bcryptjs');
const rateLimit  = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// ใช้ pool แทน single connection — reconnect อัตโนมัติเมื่อ connection หลุด
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,           // แก้: ไม่ resave session ที่ไม่มีการเปลี่ยนแปลง
    saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.user     = req.session.user_name || null;
    res.locals.userRole = req.session.user_role || null;
    db.query(
        "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre ASC",
        (err, rows) => {
            res.locals.genres = err ? [] : rows.map(r => r.genre);
            next();
        }
    );
});

// Local storage — ไฟล์เก็บใน uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, png, gif, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// จำกัด login ไม่เกิน 10 ครั้ง ใน 15 นาที
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่'
});

function isAdmin(req, res, next) {
    if (req.session.user_id && req.session.user_role === 'admin') return next();
    res.redirect('/login');
}

function isLoggedIn(req, res, next) {
    if (req.session.user_id) return next();
    res.redirect('/login');
}


// Root route
app.get('/', (req, res) => res.redirect('/home'));


app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.json({ results: [] });

    // ค้นหาใน title, genre, description และเรียงตามความเกี่ยวข้อง
    const sql = `
        SELECT *,
            (CASE
                WHEN title LIKE ? THEN 3
                WHEN genre LIKE ? THEN 2
                WHEN description LIKE ? THEN 1
                ELSE 0
            END) AS relevance
        FROM books
        WHERE title LIKE ? OR genre LIKE ? OR description LIKE ?
        ORDER BY relevance DESC, title ASC
        LIMIT 20
    `;
    const like = `%${query}%`;
    db.query(sql, [like, like, like, like, like, like], (err, results) => {
        if (err) return res.status(500).json({ error: "เกิดข้อผิดพลาดในการค้นหา" });
        res.json({ results });
    });
});


app.get('/home', (req, res) => {
    db.query("SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL", (err, categoriesResults) => {
        if (err) return res.status(500).send(err.message);

        const category = req.query.category || '';
        db.query("SELECT * FROM books WHERE genre LIKE ?", [`%${category}%`], (err, booksResults) => {
            if (err) return res.status(500).send(err.message);
            res.render('home', { categories: categoriesResults, books: booksResults, selectedCategory: category });
        });
    });
});


app.get('/admin', isAdmin, (req, res) => {
    db.query("SELECT * FROM books ORDER BY title ASC", (err, books) => {
        if (err) return res.status(500).send(err.message);
        db.query("SELECT COUNT(*) AS cnt FROM books WHERE stock = 0", (err, r1) => {
            if (err) return res.status(500).send(err.message);
            db.query("SELECT COUNT(*) AS cnt FROM orders WHERE payment_status = 'Pending'", (err, r2) => {
                if (err) return res.status(500).send(err.message);
                db.query("SELECT COALESCE(SUM(total_price),0) AS revenue FROM orders WHERE payment_status = 'Completed'", (err, r3) => {
                    if (err) return res.status(500).send(err.message);
                    res.render('admin', {
                        books,
                        stats: {
                            total:   books.length,
                            oos:     r1[0].cnt,
                            pending: r2[0].cnt,
                            revenue: r3[0].revenue
                        }
                    });
                });
            });
        });
    });
});

app.get('/admin/add', isAdmin, (req, res) => res.render('admin-add'));

app.post('/admin/add', isAdmin, upload.single('imageFile'), (req, res) => {
    const { title, genre, price, stock, imageUrl, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || '');
    db.query(
        "INSERT INTO books (title, genre, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)",
        [title, genre, price, stock, image, description],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.redirect('/admin');
        }
    );
});

app.get('/admin/edit/:id', isAdmin, (req, res) => {
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err || result.length === 0) return res.redirect('/admin');
        res.render('admin-edit', { book: result[0] });
    });
});

app.post('/admin/edit/:id', isAdmin, upload.single('imageFile'), (req, res) => {
    const { title, genre, price, stock, imageUrl, description, currentImage } = req.body;
    let image;
    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    } else if (imageUrl && imageUrl.trim() !== '') {
        image = imageUrl.trim();
    } else {
        image = currentImage;
    }
    db.query(
        "UPDATE books SET title = ?, genre = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?",
        [title, genre, price, stock, image, description, req.params.id],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.redirect('/admin');
        }
    );
});

app.post('/admin/delete/:id', isAdmin, (req, res) => {
    db.query(
        `SELECT COUNT(*) AS cnt FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         WHERE oi.book_id = ? AND o.payment_status = 'Pending'`,
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (results[0].cnt > 0) {
                return res.json({ success: false, message: 'ไม่สามารถลบได้ เนื่องจากหนังสือนี้อยู่ในคำสั่งซื้อที่รอดำเนินการอยู่' });
            }
            db.query("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true });
            });
        }
    );
});


app.get("/Book", (req, res) => {
    const category    = req.query.category || '';
    const searchQuery = req.query.search   || '';
    const sort        = req.query.sort     || '';
    const limit       = 12;
    const page        = Math.max(1, parseInt(req.query.page) || 1);
    const offset      = (page - 1) * limit;

    const orderBy = sort === 'price_asc'  ? 'ORDER BY price ASC'
                  : sort === 'price_desc' ? 'ORDER BY price DESC'
                  : 'ORDER BY title ASC';

    let countSql, dataSql, params;
    if (searchQuery) {
        const like = `%${searchQuery}%`;
        countSql = "SELECT COUNT(*) AS total FROM books WHERE title LIKE ? OR genre LIKE ? OR description LIKE ?";
        dataSql  = `SELECT * FROM books WHERE title LIKE ? OR genre LIKE ? OR description LIKE ? ${orderBy} LIMIT ? OFFSET ?`;
        params   = [like, like, like];
    } else {
        countSql = "SELECT COUNT(*) AS total FROM books WHERE genre LIKE ?";
        dataSql  = `SELECT * FROM books WHERE genre LIKE ? ${orderBy} LIMIT ? OFFSET ?`;
        params   = [`%${category}%`];
    }

    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        const total       = countResult[0].total;
        const totalPages  = Math.ceil(total / limit) || 1;
        const currentPage = Math.min(page, totalPages);

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.render("Book", {
                books: results,
                user: req.session.user_name || null,
                selectedCategory: category,
                searchQuery,
                selectedSort: sort,
                currentPage,
                totalPages,
                total
            });
        });
    });
});

app.get("/book-details/:id", (req, res) => {
    let cartData = JSON.parse(req.cookies.cart || '[]');
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.render("book-details", { book: result[0], cart: cartData });
        } else {
            res.status(404).send("ไม่พบหนังสือที่ต้องการ");
        }
    });
});


app.get('/cart', (req, res) => {
    let cartData = [];
    if (req.cookies.cart) {
        try {
            cartData = JSON.parse(req.cookies.cart);
            if (!Array.isArray(cartData)) cartData = [];
        } catch {
            cartData = [];
        }
    }
    cartData = cartData.map(item => ({
        ...item,
        image: item.image && item.image.trim() !== "" ? item.image : "/uploads/default.png"
    }));
    const totalPrice = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
    res.render('cart', { cart: cartData, totalPrice });
});

app.get('/cart/data', (req, res) => {
    try {
        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];
        cartData = cartData.map(item => ({
            ...item,
            image: item.image && item.image.trim() !== "" ? item.image : "/uploads/default.png"
        }));
        const totalPrice = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
        res.json({ cart: cartData, totalPrice });
    } catch {
        res.json({ cart: [], totalPrice: 0 });
    }
});

app.post('/cart', (req, res) => {
    let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    if (!Array.isArray(cartData)) cartData = [];

    let { id, title, price, quantity, image } = req.body;
    if (!id || !title || !price || !quantity) {
        return res.status(400).json({ success: false, message: "ข้อมูลสินค้าไม่ถูกต้อง" });
    }

    db.query("SELECT image, stock FROM books WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json({ success: false, error: "ไม่พบหนังสือ" });

        const bookImage = (image && image.trim() !== "") ? image : (results[0].image || "/uploads/default.png");
        const stock = results[0].stock;
        const addQty = parseInt(quantity);

        const existingItem = cartData.find(item => item.id == id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + addQty > stock) {
            const msg = currentQty > 0
                ? `สินค้านี้มีในสต็อกเพียง ${stock} เล่ม (มีในตะกร้าแล้ว ${currentQty} เล่ม)`
                : `สินค้านี้มีในสต็อกเพียง ${stock} เล่มเท่านั้น`;
            return res.json({ success: false, error: msg });
        }

        if (existingItem) {
            existingItem.quantity += addQty;
            existingItem.image = bookImage;
        } else {
            cartData.push({ id, title, price: parseFloat(price), quantity: addQty, image: bookImage });
        }
        res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
        res.json({ success: true, cart: cartData });
    });
});


app.get('/checkout', isLoggedIn, (req, res) => {
    let cartData = JSON.parse(req.cookies.cart || '[]');
    if (cartData.length === 0) {
        res.clearCookie("cart");
        return res.redirect('/cart');
    }
    res.render('checkout', {
        cart: cartData,
        totalPrice: cartData.reduce((sum, item) => sum + item.price * item.quantity, 0)
    });
});

// แก้: ดึงราคาจาก DB แทนการเชื่อราคาจาก cookie — ป้องกัน user แก้ราคาเอง
// แก้: ลด stock หลังสั่งซื้อสำเร็จ
app.post('/checkout', isLoggedIn, upload.single('paymentSlip'), (req, res) => {
    let cartData = JSON.parse(req.cookies.cart || '[]');
    if (cartData.length === 0) {
        return res.json({ success: false, message: 'ไม่มีสินค้าในตะกร้า' });
    }

    const { name, address, phone_number } = req.body;
    const paymentSlipPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !address || !phone_number || !paymentSlipPath) {
        return res.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }

    const phoneClean = phone_number.replace(/[-\s]/g, '');
    if (!/^0[0-9]{8,9}$/.test(phoneClean)) {
        return res.json({ success: false, message: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)' });
    }

    const bookIds = cartData.map(item => item.id);
    db.query("SELECT id, price, stock FROM books WHERE id IN (?)", [bookIds], (err, books) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const priceMap = {};
        const stockMap = {};
        books.forEach(b => {
            priceMap[b.id] = parseFloat(b.price);
            stockMap[b.id] = b.stock;
        });

        for (const item of cartData) {
            if (priceMap[item.id] === undefined) {
                return res.json({ success: false, message: `ไม่พบหนังสือ ID ${item.id}` });
            }
            if (stockMap[item.id] < item.quantity) {
                return res.json({ success: false, message: `สินค้า "${item.title}" มีไม่เพียงพอในสต็อก` });
            }
        }

        // คำนวณราคาจาก DB ไม่ใช่จาก cookie
        const totalPrice = cartData.reduce((sum, item) => sum + priceMap[item.id] * item.quantity, 0);

        db.query(
            "INSERT INTO orders (user_id, user_name, address, phone_number, total_price, payment_slip) VALUES (?, ?, ?, ?, ?, ?)",
            [req.session.user_id, name, address, phone_number, totalPrice, paymentSlipPath],
            (err, result) => {
                if (err) return res.status(500).json({ success: false, error: err.message });

                const orderId = result.insertId;
                const orderItemsValues = cartData.map(item => [orderId, item.id, item.quantity, priceMap[item.id]]);

                db.query("INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?", [orderItemsValues], (err) => {
                    if (err) return res.status(500).json({ success: false, error: err.message });

                    // ลด stock ตาม quantity ที่สั่ง (AND stock >= ? ป้องกัน race condition)
                    let remaining = cartData.length;
                    cartData.forEach(item => {
                        db.query(
                            "UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?",
                            [item.quantity, item.id, item.quantity],
                            () => { if (--remaining === 0) { res.clearCookie("cart"); res.redirect('/order-history?success=true'); } }
                        );
                    });
                });
            }
        );
    });
});


app.get('/login', (req, res) => {
    res.render('login', {
        error: req.flash('error')[0] || null,
        success: req.flash('success')[0] || null
    });
});

app.post('/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            req.flash('error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            return res.redirect('/login');
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!isMatch) {
                req.flash('error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                return res.redirect('/login');
            }

            req.session.user_id = user.user_id;
            req.session.user_name = user.username;
            req.session.user_role = user.role;

            req.session.save(() => {
                if (user.role === 'admin') return res.redirect('/admin');
                return res.redirect('/home');
            });
        });
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('cart');
        res.redirect('/login');
    });
});


app.get('/register', (req, res) => {
    res.render('register', { error: req.flash('error')[0] || null });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            req.flash('error', 'อีเมลนี้ถูกใช้งานแล้ว');
            return res.redirect('/register');
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, hashedPassword],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    req.flash('success', 'สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
                    res.redirect('/login');
                }
            );
        });
    });
});


// แก้: bug duplicate orders — group ด้วย Map แทน filter ซ้ำใน map
app.get('/order-history', isLoggedIn, (req, res) => {
    const sql = `
        SELECT o.order_id, o.order_date, o.total_price, o.payment_status, o.payment_slip,
               o.user_name, o.address, o.phone_number,
               oi.book_id, b.title, oi.quantity, oi.price,
               oi.quantity * oi.price AS total_item_price
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN books b ON oi.book_id = b.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
    `;

    db.query(sql, [req.session.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const ordersMap = {};
        results.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    order_date: row.order_date,
                    user_name: row.user_name,
                    address: row.address,
                    phone_number: row.phone_number,
                    total_item_price: row.total_price,
                    payment_status: row.payment_status,
                    payment_slip: row.payment_slip,
                    items: []
                };
            }
            ordersMap[row.order_id].items.push(row);
        });

        res.render('order-history', { orders: Object.values(ordersMap) });
    });
});


app.post('/cart/remove', (req, res) => {
    try {
        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];

        const { index } = req.body;
        if (index >= 0 && index < cartData.length) {
            cartData.splice(index, 1);
            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            return res.json({ success: true });
        }
        return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการลบ" });
    } catch {
        res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" });
    }
});

app.post('/cart/update', (req, res) => {
    let cartData;
    try {
        cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];
    } catch {
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" });
    }

    const { index, action } = req.body;
    if (!(index >= 0 && index < cartData.length)) {
        return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการอัปเดต" });
    }

    if (action === 'increase') {
        const item = cartData[index];
        db.query("SELECT stock FROM books WHERE id = ?", [item.id], (err, results) => {
            if (err) return res.json({ success: false, message: "เกิดข้อผิดพลาด" });
            const stock = results.length > 0 ? results[0].stock : 0;
            if (item.quantity >= stock) {
                return res.json({ success: false, message: `สินค้านี้มีในสต็อกเพียง ${stock} เล่มเท่านั้น` });
            }
            item.quantity += 1;
            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            return res.json({ success: true });
        });
    } else if (action === 'decrease') {
        if (cartData[index].quantity > 1) {
            cartData[index].quantity -= 1;
        } else {
            cartData.splice(index, 1);
        }
        res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
        return res.json({ success: true });
    } else {
        return res.json({ success: false, message: "action ไม่ถูกต้อง" });
    }
});


app.get('/admin/orders', isAdmin, (req, res) => {
    const sql = `
        SELECT o.order_id, o.order_date, o.total_price, o.payment_status, o.payment_slip,
               o.user_name, o.address, o.phone_number,
               oi.book_id, b.title, oi.quantity, oi.price
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN books b ON oi.book_id = b.id
        ORDER BY o.order_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err.message);

        const ordersMap = {};
        results.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    order_date: row.order_date,
                    user_name: row.user_name,
                    address: row.address,
                    phone_number: row.phone_number,
                    total_price: row.total_price,
                    payment_status: row.payment_status,
                    payment_slip: row.payment_slip,
                    items: []
                };
            }
            ordersMap[row.order_id].items.push({
                title: row.title,
                quantity: row.quantity,
                price: row.price
            });
        });

        res.render('admin-orders', { orders: Object.values(ordersMap) });
    });
});

app.post('/admin/orders/:id/status', isAdmin, (req, res) => {
    const { status } = req.body;
    const allowed = ['Pending', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    if (status !== 'Cancelled') {
        db.query(
            "UPDATE orders SET payment_status = ? WHERE order_id = ?",
            [status, req.params.id],
            (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true });
            }
        );
        return;
    }

    // Cancelled: คืน stock เฉพาะ order ที่ยังเป็น Pending (ยังไม่ส่งของ)
    db.query(
        `SELECT oi.book_id, oi.quantity FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         WHERE oi.order_id = ? AND o.payment_status = 'Pending'`,
        [req.params.id],
        (err, items) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            db.query(
                "UPDATE orders SET payment_status = 'Cancelled' WHERE order_id = ?",
                [req.params.id],
                (err) => {
                    if (err) return res.status(500).json({ success: false, error: err.message });

                    if (items.length === 0) return res.json({ success: true });

                    let remaining = items.length;
                    items.forEach(item => {
                        db.query(
                            "UPDATE books SET stock = stock + ? WHERE id = ?",
                            [item.quantity, item.book_id],
                            () => { if (--remaining === 0) res.json({ success: true }); }
                        );
                    });
                }
            );
        }
    );
});


app.get("/reviews/:book_id", (req, res) => {
    db.query("SELECT id, user, rating, comment FROM reviews WHERE book_id = ? ORDER BY id DESC", [req.params.book_id], (err, results) => {
        if (err) return res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรีวิว" });
        res.json(results);
    });
});

app.delete("/reviews/:id", isLoggedIn, (req, res) => {
    const reviewId = req.params.id;
    db.query("SELECT user FROM reviews WHERE id = ?", [reviewId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false });
        if (req.session.user_role !== 'admin' && rows[0].user !== req.session.user_name) {
            return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์ลบรีวิวนี้' });
        }
        db.query("DELETE FROM reviews WHERE id = ?", [reviewId], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});

// แก้: ต้อง login ก่อนรีวิว และชื่อมาจาก session ไม่ใช่ request body
app.post("/reviews", isLoggedIn, (req, res) => {
    const { book_id, rating, comment } = req.body;
    const user = req.session.user_name;

    if (!book_id || !rating || !comment) {
        return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบถ้วน" });
    }

    db.query(
        "SELECT id FROM reviews WHERE book_id = ? AND user = ?",
        [book_id, user],
        (err, existing) => {
            if (err) return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาด" });
            if (existing.length > 0) {
                return res.json({ success: false, error: "คุณได้รีวิวหนังสือเล่มนี้ไปแล้ว" });
            }
            db.query(
                "INSERT INTO reviews (book_id, user, rating, comment) VALUES (?, ?, ?, ?)",
                [book_id, user, rating, comment],
                (err) => {
                    if (err) return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการเพิ่มรีวิว" });
                    res.json({ success: true, message: "เพิ่มรีวิวสำเร็จ!" });
                }
            );
        }
    );
});


// ─── Profile ───────────────────────────────────────────────────────────────
app.get('/profile', isLoggedIn, (req, res) => {
    db.query(
        "SELECT user_id, username, email FROM users WHERE user_id = ?",
        [req.session.user_id],
        (err, results) => {
            if (err || results.length === 0) return res.redirect('/home');
            res.render('profile', {
                user: req.session.user_name,
                profile: results[0],
                success: req.flash('success')[0] || null,
                error:   req.flash('error')[0]   || null
            });
        }
    );
});

app.post('/profile/username', isLoggedIn, (req, res) => {
    const newName = (req.body.username || '').trim();
    if (newName.length < 3) {
        req.flash('error', 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
        return res.redirect('/profile');
    }
    db.query(
        "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
        [newName, req.session.user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length > 0) {
                req.flash('error', 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
                return res.redirect('/profile');
            }
            db.query(
                "UPDATE users SET username = ? WHERE user_id = ?",
                [newName, req.session.user_id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    req.session.user_name = newName;
                    req.flash('success', 'เปลี่ยนชื่อผู้ใช้สำเร็จ!');
                    res.redirect('/profile');
                }
            );
        }
    );
});

app.post('/profile/password', isLoggedIn, (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
        req.flash('error', 'รหัสผ่านใหม่ไม่ตรงกัน');
        return res.redirect('/profile');
    }
    if (!new_password || new_password.length < 6) {
        req.flash('error', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
        return res.redirect('/profile');
    }
    db.query(
        "SELECT password FROM users WHERE user_id = ?",
        [req.session.user_id],
        (err, results) => {
            if (err || results.length === 0) return res.redirect('/profile');
            bcrypt.compare(current_password, results[0].password, (err, isMatch) => {
                if (err || !isMatch) {
                    req.flash('error', 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
                    return res.redirect('/profile');
                }
                bcrypt.hash(new_password, 10, (err, hashed) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.query(
                        "UPDATE users SET password = ? WHERE user_id = ?",
                        [hashed, req.session.user_id],
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            req.flash('success', 'เปลี่ยนรหัสผ่านสำเร็จ!');
                            res.redirect('/profile');
                        }
                    );
                });
            });
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
