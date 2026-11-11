const Produk = require('../models/produkModel');

exports.index = async (req, res) => {
    try {
        const produk = await Produk.getAll();
        res.render('index', { produk });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};

exports.kelola = (req, res) => {
    res.render('kelola');
};