require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const flash        = require('connect-flash');

const app  = express();
const port = process.env.PORT || 3000;

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Body / cookie parsers ────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ── Session & flash ──────────────────────────────────────────────────────────
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// ── Global locals (user, genres, unreadNotifCount) ───────────────────────────
app.use(require('./middleware/globals'));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/home'));

app.use('/',       require('./routes/auth'));
app.use('/',       require('./routes/books'));
app.use('/cart',   require('./routes/cart'));
app.use('/',       require('./routes/checkout'));
app.use('/',       require('./routes/orders'));
app.use('/',       require('./routes/wishlist'));
app.use('/',       require('./routes/reviews'));
app.use('/',       require('./routes/notifications'));
app.use('/',       require('./routes/profile'));
app.use('/',       require('./routes/coupons'));
app.use('/admin',  require('./routes/admin'));

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
