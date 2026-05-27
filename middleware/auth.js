const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่'
});

function isAdmin(req, res, next) {
    if (req.session.user_id && req.session.user_role === 'admin') return next();
    res.redirect('/login');
}

function isLoggedIn(req, res, next) {
    if (req.session.user_id) return next();
    res.redirect('/login');
}

module.exports = { loginLimiter, isAdmin, isLoggedIn };
