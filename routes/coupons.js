const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

router.post('/coupon/validate', isLoggedIn, (req, res) => {
    const { code, total_price } = req.body;
    if (!code) return res.json({ success: false, message: 'กรุณากรอกโค้ดส่วนลด' });

    db.query("SELECT * FROM coupons WHERE code = ?", [code.trim().toUpperCase()], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.json({ success: false, message: 'โค้ดส่วนลดไม่ถูกต้อง' });

        const coupon = rows[0];
        if (coupon.expire_date && new Date(coupon.expire_date) < new Date()) {
            return res.json({ success: false, message: 'โค้ดนี้หมดอายุแล้ว' });
        }
        if (coupon.used_count >= coupon.usage_limit) {
            return res.json({ success: false, message: 'โค้ดนี้ถูกใช้ครบจำนวนแล้ว' });
        }
        if (parseFloat(total_price) < parseFloat(coupon.min_price)) {
            return res.json({ success: false, message: `ต้องสั่งซื้อขั้นต่ำ ฿${Number(coupon.min_price).toLocaleString()}` });
        }

        const discount = Math.floor(parseFloat(total_price) * coupon.discount_percent / 100);
        res.json({ success: true, discount_percent: coupon.discount_percent, discount, coupon_id: coupon.id });
    });
});

router.get('/admin/coupons', isAdmin, (req, res) => {
    db.query("SELECT * FROM coupons ORDER BY id DESC", (err, coupons) => {
        if (err) return res.status(500).send(err.message);
        res.render('admin-coupons', { coupons });
    });
});

router.post('/admin/coupons/add', isAdmin, (req, res) => {
    const { code, discount_percent, min_price, expire_date, usage_limit } = req.body;
    db.query(
        "INSERT INTO coupons (code, discount_percent, min_price, expire_date, usage_limit) VALUES (?, ?, ?, ?, ?)",
        [code.trim().toUpperCase(), discount_percent, min_price || 0, expire_date || null, usage_limit || 1],
        (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.redirect('/admin/coupons');
        }
    );
});

router.post('/admin/coupons/delete/:id', isAdmin, (req, res) => {
    db.query("DELETE FROM coupons WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.redirect('/admin/coupons');
    });
});

module.exports = router;
