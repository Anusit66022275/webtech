const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn } = require('../middleware/auth');

router.get('/profile', isLoggedIn, (req, res) => {
    db.query(
        "SELECT user_id, username, email FROM users WHERE user_id = ?",
        [req.session.user_id],
        (err, results) => {
            if (err || results.length === 0) return res.redirect('/home');
            res.render('profile', {
                user:    req.session.user_name,
                profile: results[0],
                success: req.flash('success')[0] || null,
                error:   req.flash('error')[0]   || null
            });
        }
    );
});

router.post('/profile/username', isLoggedIn, (req, res) => {
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

router.post('/profile/password', isLoggedIn, (req, res) => {
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

module.exports = router;
