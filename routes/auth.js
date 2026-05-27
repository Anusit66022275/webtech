const express  = require('express');
const bcrypt   = require('bcryptjs');
const router   = express.Router();
const db       = require('../db');
const { loginLimiter } = require('../middleware/auth');
const { parseCookieCart } = require('../helpers/cart');

router.get('/login', (req, res) => {
    res.render('login', {
        error:   req.flash('error')[0]   || null,
        success: req.flash('success')[0] || null
    });
});

router.post('/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            req.flash('error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            return res.redirect('/login');
        }

        const user = results[0];
        if (user.is_active === 0) {
            req.flash('error', 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
            return res.redirect('/login');
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!isMatch) {
                req.flash('error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                return res.redirect('/login');
            }

            req.session.user_id   = user.user_id;
            req.session.user_name = user.username;
            req.session.user_role = user.role;

            const cookieCart = parseCookieCart(req);
            const doRedirect = () => {
                req.session.save(() => {
                    res.clearCookie('cart');
                    if (user.role === 'admin') return res.redirect('/admin');
                    return res.redirect('/home');
                });
            };

            if (cookieCart.length === 0) return doRedirect();

            let remaining = cookieCart.length;
            cookieCart.forEach(item => {
                db.query(
                    `INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                    [user.user_id, item.id, item.quantity, item.quantity],
                    () => { if (--remaining === 0) doRedirect(); }
                );
            });
        });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('cart');
        res.redirect('/login');
    });
});

router.get('/register', (req, res) => {
    res.render('register', { error: req.flash('error')[0] || null });
});

router.post('/register', (req, res) => {
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

module.exports = router;
