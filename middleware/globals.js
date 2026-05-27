const db = require('../db');

module.exports = (req, res, next) => {
    res.locals.user             = req.session.user_name || null;
    res.locals.userRole         = req.session.user_role || null;
    res.locals.unreadNotifCount = 0;

    db.query(
        "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre ASC",
        (err, rows) => {
            res.locals.genres = err ? [] : rows.map(r => r.genre);
            if (!req.session.user_id) return next();
            db.query(
                "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0",
                [req.session.user_id],
                (err, r) => {
                    res.locals.unreadNotifCount = (!err && r.length > 0) ? r[0].cnt : 0;
                    next();
                }
            );
        }
    );
};
