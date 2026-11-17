const Produk = require('../models/produkModel');
const Pesanan = require('../models/pesananModel');
const Notifikasi = require('../models/notifikasiModel');
const User = require('../models/userModel');
const { sendNewOrderToAdmin, sendStatusToCustomer } = require('../services/email.service');

const STATUSES = ['Dicuci', 'Kering', 'Disetrika', 'Siap Ambil', 'Diambil'];
const formatRupiah = (angka) => `Rp ${Number(angka).toLocaleString('id-ID')}`;

exports.newForm = async (req, res) => {
    const produk = await Produk.getAll();
    res.render('pesanan-baru', { produk, error: null });
};

exports.create = async (req, res) => {
    const { produkId, berat, catatan } = req.body;
    const produk = await Produk.getById(produkId);
    const normalizedBerat = String(berat || '').trim().replace(',', '.');
    const beratAngka = Number.parseFloat(normalizedBerat);
    if (!produk || !Number.isFinite(beratAngka) || beratAngka <= 0) {
        return res.status(400).render('pesanan-baru', { produk: await Produk.getAll(), error: 'Pilih layanan dan isi berat cucian yang valid.' });
    }
    const estimasiSelesai = new Date();
    estimasiSelesai.setDate(estimasiSelesai.getDate() + (produk.nama.toLowerCase().includes('ekspres') ? 1 : 2));
    const kode = `LND-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    try {
        const pesanan = await Pesanan.Pesanan.create({ kode, customerId: req.session.user.id, namaPelanggan: req.session.user.nama, layanan: produk.nama, hargaPerKg: produk.harga, berat: beratAngka, catatan: (catatan || '').trim(), estimasiSelesai });
        await Notifikasi.Notifikasi.create({ userId: req.session.user.id, pesan: `Pesanan ${pesanan.kode} telah diterima dan sedang berstatus Dicuci.` });
        await sendNewOrderToAdmin(pesanan);
        return res.redirect('/pesanan-saya');
    } catch (err) {
        console.error('[Pesanan] Gagal membuat pesanan:', err.message);
        return res.status(500).render('pesanan-baru', { produk: await Produk.getAll(), error: 'Pesanan belum dapat dibuat. Silakan coba lagi.' });
    }
};

exports.myOrders = async (req, res) => {
    const [pesanan, notifikasi] = await Promise.all([Pesanan.findByCustomer(req.session.user.id), Notifikasi.findByUser(req.session.user.id)]);
    await Notifikasi.Notifikasi.update({ dibaca: true }, { where: { userId: req.session.user.id, dibaca: false } });
    res.render('pesanan-saya', { pesanan, notifikasi, formatRupiah });
};

exports.adminOrders = async (req, res) => res.render('admin-pesanan', { pesanan: await Pesanan.findAll(), statuses: STATUSES, formatRupiah });

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).send('Status pesanan tidak valid.');
    const pesanan = await Pesanan.findById(req.params.id);
    if (!pesanan) return res.status(404).send('Pesanan tidak ditemukan.');
    await pesanan.update({ status });
    const pesan = status === 'Siap Ambil'
        ? `Cucian ${pesanan.kode} sudah siap diambil. Terima kasih telah menggunakan Laundry Syah Jehan.`
        : `Status pesanan ${pesanan.kode} diperbarui menjadi: ${status}.`;
    await Notifikasi.Notifikasi.create({ userId: pesanan.customerId, pesan });
    const customer = await User.User.findByPk(pesanan.customerId);
    if (customer) await sendStatusToCustomer(pesanan, customer.email, status);
    return res.redirect('/admin/pesanan');
};
