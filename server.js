const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ตั้งค่าการใช้งาน session
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// ใช้ flash
app.use(flash());

// กำหนดที่เก็บไฟล์ของ multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// เก็บข้อมูลผู้ใช้ในหน่วยความจำ (ไม่ใช้ฐานข้อมูล)
let users = [];
let reviews = []; // array สำหรับเก็บรีวิว
let cart = [];

// 📌 หน้า Home
app.get('/home', (req, res) => {
    res.render('home', { message: 'Welcome to NUI MANGA STORE' });
});

// 📌 หน้า Book
app.get('/book', (req, res) => {
    const books = [
        { id: 1, title: 'Naruto', price: 200, image: 'https://static.wikia.nocookie.net/chainsaw-man/images/0/0f/Volume_01.png/revision/latest?cb=20230907225315' },
        { id: 2, title: 'Reborn', price: 150, image: 'https://static.wikia.nocookie.net/chainsaw-man/images/0/0f/Volume_01.png/revision/latest?cb=20230907225315' },
        { id: 3, title: 'Manga 3', price: 300, image: 'https://static.wikia.nocookie.net/chainsaw-man/images/0/0f/Volume_01.png/revision/latest?cb=20230907225315' },
        { id: 4, title: 'Manga 4', price: 350, image: 'https://static.wikia.nocookie.net/chainsaw-man/images/0/0f/Volume_01.png/revision/latest?cb=20230907225315' }
    ];
    res.render('book', { books: books });
});

// 📌 หน้า Cart
app.get('/cart', (req, res) => {
    let cartData = JSON.parse(req.cookies.cart || '[]');
    let totalPrice = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
    res.render('cart', { cart: cartData, totalPrice: totalPrice });
});

// 📌 การเพิ่มสินค้าลงในตะกร้า
app.post('/cart', (req, res) => {
    let cartData = JSON.parse(req.cookies.cart || '[]');
    const { id, title, price, quantity, image } = req.body;

    const existingItem = cartData.find(item => item.id === parseInt(id));
    if (existingItem) {
        existingItem.quantity += parseInt(quantity, 10);
    } else {
        cartData.push({ id, title, price, quantity: parseInt(quantity, 10), image });
    }

    res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
    res.json({ success: true, message: 'Item added to cart' });
});

// 📌 การลบสินค้าจากตะกร้า
app.post('/cart/remove', (req, res) => {
    const { index } = req.body;  // เปลี่ยนจาก id เป็น index
    let cartData = JSON.parse(req.cookies.cart || '[]');

    // ลบสินค้าจากตะกร้าโดยใช้ index
    if (index !== undefined) {
        cartData.splice(index, 1);
    }

    // อัพเดต cookies
    res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
    res.json({ success: true, message: 'Item removed from cart' });
});

// 📌 หน้า Checkout
app.get('/checkout', (req, res) => {
    res.render('checkout');
});

// 📌 การชำระเงิน
app.post('/checkout', upload.single('paymentSlip'), (req, res) => {
    res.send('ชำระเงินเสร็จสิ้น');
});

// 📌 หน้า Login
app.get('/login', (req, res) => {
    res.render('login');
});

// 📌 หน้า Register
app.get('/register', (req, res) => {
    res.render('register');
});

// 📌 การลงทะเบียน (Register)
app.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash('error', 'รหัสผ่านไม่ตรงกัน');
        return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    req.flash('success', 'ลงทะเบียนสำเร็จ');
    res.redirect('/login');
});

// 📌 การเข้าสู่ระบบ (Login)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        req.flash('error', 'ไม่พบผู้ใช้');
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.flash('error', 'รหัสผ่านไม่ถูกต้อง');
        return res.redirect('/login');
    }

    req.session.user = user;
    res.redirect('/home');
});

// 📌 เพิ่มรีวิว
app.post('/reviews', (req, res) => {
    const { bookId, user, rating, comment } = req.body;

    const newReview = {
        bookId,
        user,
        rating,
        comment,
        date: new Date().toISOString()
    };

    reviews.push(newReview); // เพิ่มรีวิวใน array
    res.json({ success: true });
});

// 📌 ดึงรีวิว
app.get('/reviews/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    const bookReviews = reviews.filter(review => review.bookId === bookId);
    res.json(bookReviews);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
