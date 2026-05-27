const db = require('../db');

function getCartDB(userId, cb) {
    const sql = `
        SELECT ci.book_id AS id, b.title, b.price, ci.quantity,
               COALESCE(NULLIF(b.image, ''), '/uploads/default.png') AS image,
               b.stock
        FROM cart_items ci
        JOIN books b ON ci.book_id = b.id
        WHERE ci.user_id = ?
    `;
    db.query(sql, [userId], (err, rows) => cb(err, rows || []));
}

function parseCookieCart(req) {
    try {
        const data = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        if (!Array.isArray(data)) return [];
        return data.map(item => ({
            ...item,
            image: (item.image && item.image.trim()) ? item.image : '/uploads/default.png'
        }));
    } catch { return []; }
}

module.exports = { getCartDB, parseCookieCart };
