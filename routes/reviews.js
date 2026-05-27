const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { isLoggedIn } = require('../middleware/auth');

router.get('/reviews/:book_id', (req, res) => {
    const sql = `
        SELECT r.id, u.username AS user, r.rating, r.comment, r.user_id
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = ?
        ORDER BY r.id DESC
    `;
    db.query(sql, [req.params.book_id], (err, results) => {
        if (err) return res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดรีวิว" });
        res.json(results);
    });
});

router.post('/reviews', isLoggedIn, (req, res) => {
    const { book_id, rating, comment } = req.body;
    if (!book_id || !rating || !comment) {
        return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบถ้วน" });
    }
    db.query(
        "SELECT id FROM reviews WHERE book_id = ? AND user_id = ?",
        [book_id, req.session.user_id],
        (err, existing) => {
            if (err) return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาด" });
            if (existing.length > 0) {
                return res.json({ success: false, error: "คุณได้รีวิวหนังสือเล่มนี้ไปแล้ว" });
            }
            db.query(
                "INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
                [book_id, req.session.user_id, rating, comment],
                (err) => {
                    if (err) return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการเพิ่มรีวิว" });
                    res.json({ success: true, message: "เพิ่มรีวิวสำเร็จ!" });
                }
            );
        }
    );
});

router.delete('/reviews/:id', isLoggedIn, (req, res) => {
    const reviewId = req.params.id;
    db.query("SELECT user_id FROM reviews WHERE id = ?", [reviewId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ success: false });
        if (req.session.user_role !== 'admin' && rows[0].user_id !== req.session.user_id) {
            return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์ลบรีวิวนี้' });
        }
        db.query("DELETE FROM reviews WHERE id = ?", [reviewId], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});

module.exports = router;
