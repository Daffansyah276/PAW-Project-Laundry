const Produk = require('../models/produkModel');

exports.index = (req, res) => {
    const produk = Produk.getAll();
    res.render('index', { produk });
};