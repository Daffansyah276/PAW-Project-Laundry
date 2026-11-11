require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const logger = require('./middlewares/logger');
const routes = require('./routes');
const sequelize = require('./config/database');
const seedProduk = require('./utils/seeder');

const app = express();

// Konfigurasi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routing
app.use('/', routes);

const PORT = process.env.PORT || 3000;

// Hubungkan ke database, buat tabel jika belum ada, isi data awal, lalu jalankan server.
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
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