const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn } = require('../middleware/auth');

router.get('/notifications', isLoggedIn, (req, res) => {
    db.query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        [req.session.user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.session.user_id]);
            res.json(rows);
        }
    );
});

router.get('/notifications/count', isLoggedIn, (req, res) => {
    db.query(
        "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0",
        [req.session.user_id],
        (err, rows) => res.json({ count: err ? 0 : rows[0].cnt })
    );
});

module.exports = router;
