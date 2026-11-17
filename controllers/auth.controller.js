const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const isAdminEmail = (email) => (process.env.ADMIN_EMAIL || '').split(',').map((value) => value.trim().toLowerCase()).includes(email);

const register = async (req, res) => {
    const { nama, email, telepon, password, konfirmasiPassword } = req.body;
    if (!nama || !email || !telepon || !password || !konfirmasiPassword) return res.status(400).render('register', { error: 'Semua kolom wajib diisi.' });
    if (password.length < 8) return res.status(400).render('register', { error: 'Kata sandi minimal 8 karakter.' });
    if (password !== konfirmasiPassword) return res.status(400).render('register', { error: 'Konfirmasi kata sandi tidak sama.' });

    try {
        const normalizedEmail = email.trim().toLowerCase();
        if (await User.findByEmail(normalizedEmail)) return res.status(409).render('register', { error: 'Email tersebut sudah terdaftar. Silakan masuk.' });
        const user = await User.User.create({ nama: nama.trim(), email: normalizedEmail, telepon: telepon.trim(), passwordHash: await bcrypt.hash(password, 12), role: isAdminEmail(normalizedEmail) ? 'admin' : 'customer' });
        req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
        return res.redirect('/');
    } catch (err) {
        console.error('[Auth] Registrasi gagal:', err.message);
        return res.status(500).render('register', { error: 'Registrasi gagal. Silakan coba lagi.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).render('login', { error: 'Email dan kata sandi wajib diisi.' });
    try {
        const user = await User.findByEmail(email.trim().toLowerCase());
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).render('login', { error: 'Email atau kata sandi salah.' });
        if (isAdminEmail(user.email) && user.role !== 'admin') await user.update({ role: 'admin' });
        req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
        return res.redirect('/');
    } catch (err) {
        console.error('[Auth] Login gagal:', err.message);
        return res.status(500).render('login', { error: 'Login gagal. Silakan coba lagi.' });
    }
};

const logout = (req, res) => req.session.destroy(() => res.redirect('/login'));

module.exports = { register, login, logout };
