require('dotenv').config({ quiet: true });
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const logger = require('./middlewares/logger');
const routes = require('./routes');
const sequelize = require('./config/database');
const seedProduk = require('./utils/seeder');
const User = require('./models/userModel');
require('./models/pesananModel');
require('./models/notifikasiModel');

const app = express();
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

if (!process.env.SESSION_SECRET) {
    console.warn('SESSION_SECRET belum diatur. Sesi akan berakhir saat server direstart.');
}

// Konfigurasi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 },
}));
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});
app.use(logger);

// Routing
app.use('/', routes);

const PORT = process.env.PORT || 3000;

// Hubungkan ke database, buat tabel jika belum ada, isi data awal, lalu jalankan server.
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        await User.User.sync({ alter: true });
        await seedProduk();
        app.listen(PORT, () => {
            console.log(`Server Laundry Syah Jehan berjalan di http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Gagal terhubung ke database:', err.message);
        process.exit(1);
    }
};

start();
