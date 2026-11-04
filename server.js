const express = require('express');
const path = require('path');
const logger = require('./middlewares/logger');
const routes = require('./routes');

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

// Menggunakan port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Laundry Syah Jehan berjalan di http://localhost:${PORT}`);
});
