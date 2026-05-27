const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getCartDB, parseCookieCart } = require('../helpers/cart');

router.get('/', (req, res) => {
    if (req.session.user_id) {
        getCartDB(req.session.user_id, (err, cartData) => {
            const totalPrice = cartData.reduce((t, i) => t + i.price * i.quantity, 0);
            res.render('cart', { cart: cartData, totalPrice });
        });
    } else {
        const cartData   = parseCookieCart(req);
        const totalPrice = cartData.reduce((t, i) => t + i.price * i.quantity, 0);
        res.render('cart', { cart: cartData, totalPrice });
    }
});

router.get('/data', (req, res) => {
    if (req.session.user_id) {
        getCartDB(req.session.user_id, (err, cartData) => {
            if (err) return res.json({ cart: [], totalPrice: 0 });
            const totalPrice = cartData.reduce((t, i) => t + i.price * i.quantity, 0);
            res.json({ cart: cartData, totalPrice });
        });
    } else {
        const cartData   = parseCookieCart(req);
        const totalPrice = cartData.reduce((t, i) => t + i.price * i.quantity, 0);
        res.json({ cart: cartData, totalPrice });
    }
});

router.post('/', (req, res) => {
    const { id, title, price, quantity, image } = req.body;
    if (!id || !title || !price || !quantity) {
        return res.status(400).json({ success: false, message: "ข้อมูลสินค้าไม่ถูกต้อง" });
    }
    const addQty = parseInt(quantity);

    db.query("SELECT image, stock FROM books WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json({ success: false, error: "ไม่พบหนังสือ" });

        const bookImage = (image && image.trim()) ? image : (results[0].image || '/uploads/default.png');
        const stock     = results[0].stock;

        if (req.session.user_id) {
            db.query(
                "SELECT quantity FROM cart_items WHERE user_id = ? AND book_id = ?",
                [req.session.user_id, id],
                (err, existing) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const currentQty = existing.length > 0 ? existing[0].quantity : 0;
                    if (currentQty + addQty > stock) {
                        const msg = currentQty > 0
                            ? `สินค้านี้มีในสต็อกเพียง ${stock} เล่ม (มีในตะกร้าแล้ว ${currentQty} เล่ม)`
                            : `สินค้านี้มีในสต็อกเพียง ${stock} เล่มเท่านั้น`;
                        return res.json({ success: false, error: msg });
                    }
                    db.query(
                        `INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)
                         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                        [req.session.user_id, id, addQty, addQty],
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            getCartDB(req.session.user_id, (err, cartData) => {
                                res.json({ success: true, cart: cartData || [] });
                            });
                        }
                    );
                }
            );
        } else {
            let cartData     = parseCookieCart(req);
            const existingItem = cartData.find(item => item.id == id);
            const currentQty   = existingItem ? existingItem.quantity : 0;
            if (currentQty + addQty > stock) {
                const msg = currentQty > 0
                    ? `สินค้านี้มีในสต็อกเพียง ${stock} เล่ม (มีในตะกร้าแล้ว ${currentQty} เล่ม)`
                    : `สินค้านี้มีในสต็อกเพียง ${stock} เล่มเท่านั้น`;
                return res.json({ success: false, error: msg });
            }
            if (existingItem) {
                existingItem.quantity += addQty;
                existingItem.image     = bookImage;
            } else {
                cartData.push({ id, title, price: parseFloat(price), quantity: addQty, image: bookImage });
            }
            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            res.json({ success: true, cart: cartData });
        }
    });
});

router.post('/remove', (req, res) => {
    const { index } = req.body;
    if (req.session.user_id) {
        getCartDB(req.session.user_id, (err, cartData) => {
            if (err || !(index >= 0 && index < cartData.length)) {
                return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการลบ" });
            }
            const bookId = cartData[index].id;
            db.query("DELETE FROM cart_items WHERE user_id = ? AND book_id = ?",
                [req.session.user_id, bookId],
                (err) => err
                    ? res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" })
                    : res.json({ success: true })
            );
        });
    } else {
        try {
            const cartData = parseCookieCart(req);
            if (index >= 0 && index < cartData.length) {
                cartData.splice(index, 1);
                res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
                return res.json({ success: true });
            }
            return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการลบ" });
        } catch {
            res.json({ success: false, message: "เกิดข้อผิดพลาดในการลบสินค้า" });
        }
    }
});

router.post('/update', (req, res) => {
    const { index, action } = req.body;

    if (req.session.user_id) {
        getCartDB(req.session.user_id, (err, cartData) => {
            if (err || !(index >= 0 && index < cartData.length)) {
                return res.json({ success: false, message: "ไม่พบสินค้าที่ต้องการอัปเดต" });
            }
            const item = cartData[index];
            if (action === 'increase') {
                db.query("SELECT stock FROM books WHERE id = ?", [item.id], (err, results) => {
                    if (err) return res.json({ success: false, message: "เกิดข้อผิดพลาด" });
                    const stock = results.length > 0 ? results[0].stock : 0;
                    if (item.quantity >= stock) {
                        return res.json({ success: false, message: `สินค้านี้มีในสต็อกเพียง ${stock} เล่มเท่านั้น` });
                    }
                    db.query("UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND book_id = ?",
                        [req.session.user_id, item.id],
                        (err) => err ? res.json({ success: false }) : res.json({ success: true })
                    );
                });
            } else if (action === 'decrease') {
                if (item.quantity > 1) {
                    db.query("UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = ? AND book_id = ?",
                        [req.session.user_id, item.id],
                        (err) => err ? res.json({ success: false }) : res.json({ success: true })
                    );
                } else {
                    db.query("DELETE FROM cart_items WHERE user_id = ? AND book_id = ?",
                        [req.session.user_id, item.id],
                        (err) => err ? res.json({ success: false }) : res.json({ success: true })
                    );
                }
            } else {
                res.json({ success: false, message: "action ไม่ถูกต้อง" });
            }
        });
    } else {
        let cartData;
        try { cartData = parseCookieCart(req); }
        catch { return res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" }); }

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
            if (cartData[index].quantity > 1) cartData[index].quantity -= 1;
            else cartData.splice(index, 1);
            res.cookie('cart', JSON.stringify(cartData), { httpOnly: true, maxAge: 3600000 });
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "action ไม่ถูกต้อง" });
        }
    }
});

module.exports = router;
