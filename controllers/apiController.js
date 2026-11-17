const Produk = require('../models/produkModel');
const { parseId, validasiProduk } = require('../utils/validasi');

exports.getStatus = (req, res) => {
    res.json({ 
        status: "ok", 
        aplikasi: "Laundry Syah Jehan",
        uptimeDetik: Math.floor(process.uptime()),
        waktuServer: new Date().toISOString()
    });
};

// GET /api/produk
exports.getProduk = async (req, res) => {
    try {
        const data = await Produk.getAll();
        res.status(200).json({ status: 'success', message: 'Data produk berhasil diambil.', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
    }
};

// GET /api/produk/:id
exports.getProdukById = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID tidak valid.' });

    try {
        const data = await Produk.getById(id);
        if (!data) return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan.' });
        res.status(200).json({ status: 'success', message: 'Detail produk berhasil diambil.', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
    }
};

// POST /api/produk
exports.createProduk = async (req, res) => {
    const { error, data } = validasiProduk(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error });

    try {
        const baru = await Produk.create(data);
        res.status(201).json({ status: 'success', message: 'Produk berhasil ditambahkan.', data: baru });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT /api/produk/:id
exports.updateProduk = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID tidak valid.' });

    const { error, data } = validasiProduk(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error });

    try {
        const diperbarui = await Produk.update(id, data);
        if (!diperbarui) return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan.' });
        res.status(200).json({ status: 'success', message: 'Produk berhasil diperbarui.', data: diperbarui });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE /api/produk/:id
exports.deleteProduk = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID tidak valid.' });

    try {
        const terhapus = await Produk.remove(id);
        if (!terhapus) return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan.' });
        res.status(200).json({ status: 'success', message: 'Produk berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
    }
};