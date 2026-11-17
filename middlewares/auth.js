const requireAuth = (req, res, next) => {
    if (req.session?.user) return next();
    return res.redirect('/login');
};

const requireAdmin = (req, res, next) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session.user.role === 'admin') return next();
    return res.status(403).send('Halaman ini hanya dapat diakses admin.');
};

module.exports = { requireAuth, requireAdmin };
