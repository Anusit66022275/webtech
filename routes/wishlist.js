const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn } = require('../middleware/auth');

router.get('/wishlist', isLoggedIn, (req, res) => {
    const sql = `
        SELECT b.id, b.title, b.price, b.image, b.genre, b.stock
        FROM wishlists w
        JOIN books b ON w.book_id = b.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `;
    db.query(sql, [req.session.user_id], (err, books) => {
        if (err) return res.status(500).send(err.message);
        res.render('wishlist', { books });
    });
});

router.post('/wishlist/toggle', isLoggedIn, (req, res) => {
    const { book_id } = req.body;
    db.query("SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?",
        [req.session.user_id, book_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length > 0) {
                db.query("DELETE FROM wishlists WHERE user_id = ? AND book_id = ?",
                    [req.session.user_id, book_id],
                    (err) => err
                        ? res.status(500).json({ error: err.message })
                        : res.json({ success: true, wishlisted: false })
                );
            } else {
                db.query("INSERT INTO wishlists (user_id, book_id) VALUES (?, ?)",
                    [req.session.user_id, book_id],
                    (err) => err
                        ? res.status(500).json({ error: err.message })
                        : res.json({ success: true, wishlisted: true })
                );
            }
        }
    );
});

module.exports = router;
