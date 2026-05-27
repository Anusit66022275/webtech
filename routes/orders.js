const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn } = require('../middleware/auth');

router.get('/order-history', isLoggedIn, (req, res) => {
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
                    order_id:       row.order_id,
                    order_date:     row.order_date,
                    user_name:      row.user_name,
                    address:        row.address,
                    phone_number:   row.phone_number,
                    total_item_price: row.total_price,
                    payment_status: row.payment_status,
                    payment_slip:   row.payment_slip,
                    items:          []
                };
            }
            ordersMap[row.order_id].items.push(row);
        });

        res.render('order-history', { orders: Object.values(ordersMap) });
    });
});

module.exports = router;
