require('dotenv').config(); // ✅ โหลดตัวแปรจาก .env

const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000; // ✅ ใช้ค่าจาก .env ถ้าไม่มีให้ใช้ 3000


// ✅ เชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect(err => {
    if (err) throw err;
    console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ");
});


// ✅ ตั้งค่า Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET_KEY,  // ✅ ดึงค่าจาก .env
    resave: true,
    saveUninitialized: false
}));
app.use(flash());


// ✅ Middleware ส่งข้อมูล `user` ไปยังทุกหน้า
app.use((req, res, next) => {
    res.locals.user = req.session.user_name || null;
    next();
});


// ✅ ตั้งค่าการอัปโหลดรูป
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({ results: [] });
    }

    const sql = "SELECT * FROM books WHERE title LIKE ? OR genre LIKE ?";
    db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "เกิดข้อผิดพลาดในการค้นหา" });
        }
        res.json({ results });
    });
});


// ✅ หน้า Home พร้อมกรองหมวดหมู่
app.get('/home', (req, res) => {
    const getCategoriesQuery = "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL";
    db.query(getCategoriesQuery, (err, categoriesResults) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const category = req.query.category || ''; 

        const getBooksQuery = "SELECT * FROM books WHERE genre LIKE ?";
        db.query(getBooksQuery, [`%${category}%`], (err, booksResults) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            res.render('home', {
                categories: categoriesResults,
                books: booksResults,
                selectedCategory: category
            });
        });
    });
});


// ✅ Middleware ตรวจสอบสิทธิ์แอดมิน
function isAdmin(req, res, next) {
    console.log("🔍 ตรวจสอบสิทธิ์แอดมิน:", req.session.user_id, req.session.user_role);
    if (req.session.user_id && req.session.user_role === 'admin') {
        return next();
    }
    res.redirect('/login');
}


// ✅ หน้า Admin Dashboard
app.get('/admin', isAdmin, (req, res) => {
    db.query("SELECT * FROM books", (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.render('admin', { books: results });
    });
});


// ✅ เพิ่มหนังสือ
app.get('/admin/add', isAdmin, (req, res) => {
    res.render('admin-add');
});

app.post('/admin/add', isAdmin, (req, res) => {
    const { title, genre, price, stock, image, description } = req.body;
    const sql = "INSERT INTO books (title, genre, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [title, genre, price, stock, image, description], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/admin');
    });
});


// ✅ แก้ไขหนังสือ
app.get('/admin/edit/:id', isAdmin, (req, res) => {
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err || result.length === 0) return res.redirect('/admin');
        res.render('admin-edit', { book: result[0] });
    });
});

app.post('/admin/edit/:id', isAdmin, (req, res) => {
    const { title, genre, price, stock, image, description } = req.body;
    
    const sql = "UPDATE books SET title = ?, genre = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?";
    
    db.query(sql, [title, genre, price, stock, image, description, req.params.id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/admin');
    });
});


// ✅ ลบหนังสือ
app.post('/admin/delete/:id', isAdmin, (req, res) => {
    db.query("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/admin');
    });
});


const plainPassword = "admin123"; // เปลี่ยนเป็นรหัสที่ต้องการ
bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) console.error("❌ Error:", err);
    else console.log("✅ รหัสผ่านที่เข้ารหัส:", hashedPassword);
});


// ✅ โชว์หนังสือจากฐานข้อมูลพร้อมกรองหมวดหมู่
app.get("/Book", (req, res) => {
    const category = req.query.category || '';
    const sql = "SELECT * FROM books WHERE genre LIKE ?";
    db.query(sql, [`%${category}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.render("Book", { books: results, user: req.session.user_name || null, selectedCategory: category });
    });
});


// ✅ แสดงรายละเอียดหนังสือ พร้อมข้อมูลตะกร้า
app.get("/book-details/:id", (req, res) => {
    const bookId = req.params.id;
    const sql = "SELECT * FROM books WHERE id = ?";
    let cartData = JSON.parse(req.cookies.cart || '[]'); // ✅ ดึงข้อมูลตะกร้า
    
    db.query(sql, [bookId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.render("book-details", { 
                book: result[0], 
                cart: cartData  // ✅ ส่งข้อมูลตะกร้าไปยัง book-details.ejs
            });
        } else {
            res.status(404).send("ไม่พบหนังสือที่ต้องการ");
        }
    });
});



// ✅ เส้นทาง `/cart` แสดงหน้า EJS
app.get('/cart', (req, res) => {
    try {
        console.log("📝 คุกกี้ cart:", req.cookies.cart);
        
        let cartData = [];
        if (req.cookies.cart) {
            try {
                cartData = JSON.parse(req.cookies.cart);
                if (!Array.isArray(cartData)) cartData = [];
            } catch (error) {
                console.error("❌ Error parsing cart JSON:", error);
                cartData = [];
            }
        }

        cartData = cartData.map(item => ({
            ...item,
            image: item.image && item.image.trim() !== "" ? item.image : "/uploads/default.png"
        }));

        let totalPrice = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
        
        console.log("📦 ตะกร้าที่ส่งไปยัง EJS:", cartData);
        res.render('cart', { cart: cartData, totalPrice: totalPrice });
    } catch (error) {
        console.error("❌ Error processing cart data:", error);
        res.render('cart', { cart: [], totalPrice: 0 });
    }
});


// ✅ API `/cart/data` สำหรับดึงข้อมูลตะกร้าแบบ JSON
app.get('/cart/data', (req, res) => {
    try {
        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];

        cartData = cartData.map(item => ({
            ...item,
            image: item.image && item.image.trim() !== "" ? item.image : "/uploads/default.png"
        }));

        let totalPrice = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
        res.json({ cart: cartData, totalPrice });
    } catch (error) {
        console.error("❌ Error parsing cart data:", error);
        res.json({ cart: [], totalPrice: 0 });
    }
});


// ✅ เพิ่มสินค้าไปยังตะกร้า
app.post('/cart', (req, res) => {
    try {
        console.log("🛒 รับข้อมูลสินค้า:", req.body); // Debug: เช็คค่าที่ส่งมาจาก frontend

        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];

        let { id, title, price, quantity, image } = req.body;

        if (!id || !title || !price || !quantity) {
            return res.status(400).json({ success: false, message: "ข้อมูลสินค้าไม่ถูกต้อง" });
        }

        if (!image || image.trim() === "") {
            db.query("SELECT image FROM books WHERE id = ?", [id], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });

                if (results.length > 0) {
                    image = results[0].image || "/uploads/default.png";
                }

                addToCart(cartData, id, title, price, quantity, image, res);
            });
        } else {
            addToCart(cartData, id, title, price, quantity, image, res);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเพิ่มสินค้า" });
    }
});


// ✅ ฟังก์ชันเพิ่มสินค้าเข้าตะกร้า
function addToCart(cartData, id, title, price, quantity, image, res) {
    const existingItem = cartData.find(item => item.id == id);
    if (existingItem) {
        existingItem.quantity += parseInt(quantity);
        existingItem.image = image;
    } else {
        cartData.push({ id, title, price: parseFloat(price), quantity: parseInt(quantity), image });
    }

    console.log("📦 ตะกร้าหลังจากเพิ่มสินค้า:", cartData);

    res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
    res.json({ success: true, cart: cartData });
}


// ✅ ระบบ Checkout
app.get('/checkout', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

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

app.post('/checkout', upload.single('paymentSlip'), (req, res) => {
    if (!req.session.user_id) {
        return res.json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" });
    }

    let cartData = JSON.parse(req.cookies.cart || '[]');
    if (cartData.length === 0) {
        return res.json({ success: false, message: 'ไม่มีสินค้าในตะกร้า' });
    }

    const { name, address, phone_number } = req.body;
    const userId = req.session.user_id;
    const paymentSlipPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !address || !phone_number || !paymentSlipPath) {
        return res.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }

    const totalPrice = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderSql = "INSERT INTO orders (user_id, user_name, address, phone_number, total_price, payment_slip) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(orderSql, [userId, name, address, phone_number, totalPrice, paymentSlipPath], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const orderId = result.insertId;
        const orderItemsSql = "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?";
        const orderItemsValues = cartData.map(item => [orderId, item.id, item.quantity, item.price]);

        db.query(orderItemsSql, [orderItemsValues], (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            res.clearCookie("cart");
            res.redirect('/order-history?success=true');
        });
    });
});


// ✅ ระบบเข้าสู่ระบบ
app.get('/login', (req, res) => {
    res.render('login', { 
        error: req.flash('error')[0] || null, 
        success: req.flash('success')[0] || null
    });
});


app.post('/login', (req, res) => {
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

            // ✅ บันทึกค่า session
            req.session.user_id = user.user_id;
            req.session.user_name = user.username;
            req.session.user_role = user.role;

            console.log("✅ Session ถูกเซ็ต:", req.session);

            req.session.save(() => {  // **บังคับให้เซฟ session ก่อน redirect**
                if (user.role === 'admin') {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/home');
                }
            });
        });
    });
});


// ✅ ระบบออกจากระบบ
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('cart');
        res.redirect('/login');
    });
});


// ✅ ระบบสมัครสมาชิก
app.get('/register', (req, res) => {
    res.render('register');
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

            const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });

                req.flash('success', 'สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
                res.redirect('/login');
            });
        });
    });
});


// ✅ แสดงประวัติการซื้อ
app.get('/order-history', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;
    const sql = `
        SELECT o.order_id, o.order_date, o.total_price, o.payment_status, o.payment_slip, o.user_name, o.address, o.phone_number,
               oi.book_id, b.title, oi.quantity, oi.price, oi.quantity * oi.price AS total_item_price
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN books b ON oi.book_id = b.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC;
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const orders = results.map(order => {
            return {
                order_id: order.order_id,
                order_date: order.order_date,
                user_name: order.user_name,
                address: order.address,
                phone_number: order.phone_number,
                total_item_price: order.total_price,
                payment_status: order.payment_status,
                payment_slip: order.payment_slip,
                items: results.filter(item => item.order_id === order.order_id)
            };
        });

        res.render('order-history', { orders });
    });
});


// ✅ ลบสินค้าออกจากตะกร้า
app.post('/cart/remove', (req, res) => {
    try {
        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];

        const { index } = req.body;

        if (index >= 0 && index < cartData.length) {
            cartData.splice(index, 1);
            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการลบ" });
        }

    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
        res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" });
    }
});


// ✅ อัปเดตจำนวนสินค้าในตะกร้า
app.post('/cart/update', (req, res) => {
    try {
        let cartData = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(cartData)) cartData = [];

        const { index, action } = req.body;

        if (index >= 0 && index < cartData.length) {
            if (action === 'increase') {
                cartData[index].quantity += 1;
            } else if (action === 'decrease' && cartData[index].quantity > 1) {
                cartData[index].quantity -= 1;
            } else if (action === 'decrease' && cartData[index].quantity === 1) {
                cartData.splice(index, 1);
            }

            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการอัปเดต" });
        }

    } catch (error) {
        console.error("❌ Error updating cart:", error);
        res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" });
    }
});



// ✅ ดึงรีวิวจากฐานข้อมูล (GET)
app.get("/reviews/:book_id", (req, res) => {
    const { book_id } = req.params;
    
    db.query("SELECT user, rating, comment FROM reviews WHERE book_id = ?", [book_id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching reviews:", err);
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรีวิว" });
        } else {
            res.json(results);
        }
    });
});

// รีวิว
app.post("/reviews", (req, res) => {
    console.log("📩 ข้อมูลที่ได้รับจาก Frontend:", req.body); // ✅ Debug

    const { book_id, user, rating, comment } = req.body;

    if (!book_id || !user || !rating || !comment) {
        console.error("❌ ข้อมูลไม่ครบถ้วน:", req.body);
        return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบถ้วน" });
    }

    const sql = "INSERT INTO reviews (book_id, user, rating, comment) VALUES (?, ?, ?, ?)";
    db.query(sql, [book_id, user, rating, comment], (err, result) => {
        if (err) {
            console.error("❌ Error adding review:", err);
            return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการเพิ่มรีวิว" });
        }
        console.log("✅ เพิ่มรีวิวสำเร็จ:", result);
        res.json({ success: true, message: "เพิ่มรีวิวสำเร็จ!" });
    });
});



app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
