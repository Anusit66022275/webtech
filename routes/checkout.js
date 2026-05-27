const express  = require('express');
const router   = express.Router();
const db       = require('../db');
const upload   = require('../middleware/upload');
const { isLoggedIn } = require('../middleware/auth');
const { getCartDB }  = require('../helpers/cart');

router.get('/', isLoggedIn, (req, res) => {
    getCartDB(req.session.user_id, (err, cartData) => {
        if (err || cartData.length === 0) return res.redirect('/cart');
        res.render('checkout', {
            cart:       cartData,
            totalPrice: cartData.reduce((sum, item) => sum + item.price * item.quantity, 0),
            error:      req.flash('error')[0] || null
        });
    });
});

router.post('/', isLoggedIn, upload.single('paymentSlip'), (req, res) => {
    getCartDB(req.session.user_id, (err, cartData) => {
        if (err || cartData.length === 0) {
            req.flash('error', 'ไม่มีสินค้าในตะกร้า');
            return res.redirect('/cart');
        }

        const { name, address, phone_number } = req.body;
        const paymentSlipPath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !address || !phone_number || !paymentSlipPath) {
            req.flash('error', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return res.redirect('/checkout');
        }

        const phoneClean = phone_number.replace(/[-\s]/g, '');
        if (!/^0[0-9]{8,9}$/.test(phoneClean)) {
            req.flash('error', 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก เช่น 0812345678)');
            return res.redirect('/checkout');
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
                    req.flash('error', `ไม่พบหนังสือ ID ${item.id}`);
                    return res.redirect('/checkout');
                }
                if (stockMap[item.id] < item.quantity) {
                    req.flash('error', `สินค้า "${item.title}" มีไม่เพียงพอในสต็อก`);
                    return res.redirect('/checkout');
                }
            }

            let totalPrice   = cartData.reduce((sum, item) => sum + priceMap[item.id] * item.quantity, 0);
            const discount   = Math.min(parseFloat(req.body.discount) || 0, totalPrice);
            const couponCode = (req.body.coupon_code || '').trim().toUpperCase();
            totalPrice       = Math.max(0, totalPrice - discount);

            db.query(
                "INSERT INTO orders (user_id, user_name, address, phone_number, total_price, payment_slip) VALUES (?, ?, ?, ?, ?, ?)",
                [req.session.user_id, name, address, phone_number, totalPrice, paymentSlipPath],
                (err, result) => {
                    if (err) return res.status(500).json({ success: false, error: err.message });

                    const orderId = result.insertId;
                    if (couponCode) {
                        db.query("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", [couponCode]);
                    }

                    const orderItemsValues = cartData.map(item => [orderId, item.id, item.quantity, priceMap[item.id]]);
                    db.query("INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?", [orderItemsValues], (err) => {
                        if (err) return res.status(500).json({ success: false, error: err.message });

                        let remaining = cartData.length;
                        cartData.forEach(item => {
                            db.query(
                                "UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?",
                                [item.quantity, item.id, item.quantity],
                                () => {
                                    if (--remaining === 0) {
                                        db.query("DELETE FROM cart_items WHERE user_id = ?", [req.session.user_id], () => {
                                            res.redirect('/order-history?success=true');
                                        });
                                    }
                                }
                            );
                        });
                    });
                }
            );
        });
    });
});

module.exports = router;
