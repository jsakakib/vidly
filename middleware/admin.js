
module.exports = function (req, res, next) {
    // 401 Unauthorized - invalid token
    // 403 Forbiden

    if (!req.user.isAdmin) return res.status(403).send('Access denied.');
    next();
}