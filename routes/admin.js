const express = require('express');
const router  = express.Router();
const db      = require('../db');
const upload  = require('../middleware/upload');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, (req, res) => {
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

router.get('/add', isAdmin, (req, res) => res.render('admin-add'));

router.post('/add', isAdmin, upload.single('imageFile'), (req, res) => {
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

router.get('/edit/:id', isAdmin, (req, res) => {
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err || result.length === 0) return res.redirect('/admin');
        res.render('admin-edit', { book: result[0] });
    });
});

router.post('/edit/:id', isAdmin, upload.single('imageFile'), (req, res) => {
    const { title, genre, price, stock, imageUrl, description, currentImage } = req.body;
    let image;
    if (req.file)                        image = `/uploads/${req.file.filename}`;
    else if (imageUrl && imageUrl.trim()) image = imageUrl.trim();
    else                                  image = currentImage;

    db.query(
        "UPDATE books SET title = ?, genre = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?",
        [title, genre, price, stock, image, description, req.params.id],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.redirect('/admin');
        }
    );
});

router.post('/delete/:id', isAdmin, (req, res) => {
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

router.get('/orders', isAdmin, (req, res) => {
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
                    order_id:       row.order_id,
                    order_date:     row.order_date,
                    user_name:      row.user_name,
                    address:        row.address,
                    phone_number:   row.phone_number,
                    total_price:    row.total_price,
                    payment_status: row.payment_status,
                    payment_slip:   row.payment_slip,
                    items:          []
                };
            }
            ordersMap[row.order_id].items.push({ title: row.title, quantity: row.quantity, price: row.price });
        });

        res.render('admin-orders', { orders: Object.values(ordersMap) });
    });
});

router.post('/orders/:id/status', isAdmin, (req, res) => {
    const { status } = req.body;
    const allowed = ['Pending', 'Completed', 'Cancelled', 'Shipped', 'Delivered'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    const statusMessages = {
        Completed: 'คำสั่งซื้อ #ORDER ได้รับการยืนยันการชำระเงินแล้ว',
        Shipped:   'คำสั่งซื้อ #ORDER ถูกจัดส่งแล้ว กำลังอยู่ระหว่างการส่ง',
        Delivered: 'คำสั่งซื้อ #ORDER ส่งถึงปลายทางแล้ว',
        Cancelled: 'คำสั่งซื้อ #ORDER ถูกยกเลิกแล้ว'
    };

    const sendNotification = (orderId, userId) => {
        const msg = (statusMessages[status] || `คำสั่งซื้อ #ORDER อัปเดตสถานะเป็น ${status}`)
            .replace('#ORDER', orderId);
        db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, msg]);
    };

    if (status !== 'Cancelled') {
        db.query(
            "UPDATE orders SET payment_status = ? WHERE order_id = ?",
            [status, req.params.id],
            (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                db.query("SELECT user_id FROM orders WHERE order_id = ?", [req.params.id], (err, rows) => {
                    if (!err && rows.length > 0 && rows[0].user_id) sendNotification(req.params.id, rows[0].user_id);
                });
                res.json({ success: true });
            }
        );
        return;
    }

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

                    db.query("SELECT user_id FROM orders WHERE order_id = ?", [req.params.id], (err, rows) => {
                        if (!err && rows.length > 0 && rows[0].user_id) sendNotification(req.params.id, rows[0].user_id);
                    });

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

router.get('/stats/top-books', isAdmin, (req, res) => {
    const sql = `
        SELECT b.title, SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN books b ON oi.book_id = b.id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.payment_status IN ('Completed','Delivered')
        GROUP BY b.id
        ORDER BY total_sold DESC
        LIMIT 5
    `;
    db.query(sql, (err, rows) => res.json(err ? [] : rows));
});

router.get('/stats/revenue', isAdmin, (req, res) => {
    const sql = `
        SELECT DATE_FORMAT(order_date, '%Y-%m-%d') AS day,
               SUM(total_price) AS revenue
        FROM orders
        WHERE payment_status IN ('Completed','Delivered')
          AND order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY day
        ORDER BY day ASC
    `;
    db.query(sql, (err, rows) => res.json(err ? [] : rows));
});

router.get('/users', isAdmin, (req, res) => {
    db.query("SELECT user_id, username, email, role, is_active FROM users ORDER BY user_id ASC", (err, users) => {
        if (err) return res.status(500).send(err.message);
        res.render('admin-users', { users });
    });
});

router.post('/users/:id/role', isAdmin, (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ success: false });
    if (parseInt(req.params.id) === req.session.user_id) {
        return res.json({ success: false, message: 'ไม่สามารถเปลี่ยน role ของตัวเองได้' });
    }
    db.query("UPDATE users SET role = ? WHERE user_id = ?", [role, req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

router.post('/users/:id/toggle', isAdmin, (req, res) => {
    if (parseInt(req.params.id) === req.session.user_id) {
        return res.json({ success: false, message: 'ไม่สามารถระงับบัญชีตัวเองได้' });
    }
    db.query(
        "UPDATE users SET is_active = NOT is_active WHERE user_id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true });
        }
    );
});

module.exports = router;
