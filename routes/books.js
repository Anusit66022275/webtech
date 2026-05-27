const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/home', (req, res) => {
    db.query("SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL", (err, categoriesResults) => {
        if (err) return res.status(500).send(err.message);
        const category = req.query.category || '';
        db.query("SELECT * FROM books WHERE genre LIKE ?", [`%${category}%`], (err, booksResults) => {
            if (err) return res.status(500).send(err.message);
            res.render('home', { categories: categoriesResults, books: booksResults, selectedCategory: category });
        });
    });
});

router.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.json({ results: [] });

    const sql = `
        SELECT *,
            (CASE
                WHEN title LIKE ? THEN 3
                WHEN genre LIKE ? THEN 2
                WHEN description LIKE ? THEN 1
                ELSE 0
            END) AS relevance
        FROM books
        WHERE title LIKE ? OR genre LIKE ? OR description LIKE ?
        ORDER BY relevance DESC, title ASC
        LIMIT 20
    `;
    const like = `%${query}%`;
    db.query(sql, [like, like, like, like, like, like], (err, results) => {
        if (err) return res.status(500).json({ error: "เกิดข้อผิดพลาดในการค้นหา" });
        res.json({ results });
    });
});

router.get('/Book', (req, res) => {
    const category    = req.query.category || '';
    const searchQuery = req.query.search   || '';
    const sort        = req.query.sort     || '';
    const limit       = 12;
    const page        = Math.max(1, parseInt(req.query.page) || 1);
    const offset      = (page - 1) * limit;

    const orderBy = sort === 'price_asc'  ? 'ORDER BY price ASC'
                  : sort === 'price_desc' ? 'ORDER BY price DESC'
                  : 'ORDER BY title ASC';

    let countSql, dataSql, params;
    if (searchQuery) {
        const like = `%${searchQuery}%`;
        countSql = "SELECT COUNT(*) AS total FROM books WHERE title LIKE ? OR genre LIKE ? OR description LIKE ?";
        dataSql  = `SELECT * FROM books WHERE title LIKE ? OR genre LIKE ? OR description LIKE ? ${orderBy} LIMIT ? OFFSET ?`;
        params   = [like, like, like];
    } else {
        countSql = "SELECT COUNT(*) AS total FROM books WHERE genre LIKE ?";
        dataSql  = `SELECT * FROM books WHERE genre LIKE ? ${orderBy} LIMIT ? OFFSET ?`;
        params   = [`%${category}%`];
    }

    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        const total       = countResult[0].total;
        const totalPages  = Math.ceil(total / limit) || 1;
        const currentPage = Math.min(page, totalPages);

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.render('Book', {
                books: results,
                user: req.session.user_name || null,
                selectedCategory: category,
                searchQuery,
                selectedSort: sort,
                currentPage,
                totalPages,
                total
            });
        });
    });
});

router.get('/book-details/:id', (req, res) => {
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).send("ไม่พบหนังสือที่ต้องการ");

        const book = result[0];
        if (!req.session.user_id) {
            return res.render('book-details', { book, wishlisted: false });
        }
        db.query("SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?",
            [req.session.user_id, book.id],
            (err, wRows) => {
                res.render('book-details', { book, wishlisted: wRows && wRows.length > 0 });
            }
        );
    });
});

module.exports = router;
