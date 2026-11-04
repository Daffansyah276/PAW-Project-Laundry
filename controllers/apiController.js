const Produk = require('../models/produkModel');

exports.getStatus = (req, res) => {
    res.json({ 
        status: "ok", 
        aplikasi: "Laundry Syah Jehan",
        uptimeDetik: Math.floor(process.uptime()),
        waktuServer: new Date().toISOString()
    });
};

exports.getProduk = (req, res) => {
    res.json(Produk.getAll());
};