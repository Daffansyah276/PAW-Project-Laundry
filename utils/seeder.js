const Produk = require('../models/produkModel');

const dataAwal = [
    {
        nama: "Cuci Komplit Reguler",
        deskripsi: "Cuci, kering, dan setrika rapi. Selesai dalam 2 hari.",
        kategori: "Layanan Kiloan",
        harga: 6000,
        stok: "Tersedia"
    },
    {
        nama: "Cuci Komplit Ekspres",
        deskripsi: "Cuci, kering, dan setrika kilat. Selesai dalam 1 hari.",
        kategori: "Layanan Kiloan",
        harga: 10000,
        stok: "Tersedia"
    },
    {
        nama: "Setrika Saja",
        deskripsi: "Pakaian disetrika rapi dan wangi. Selesai dalam 1 hari.",
        kategori: "Layanan Kiloan",
        harga: 4000,
        stok: "Tersedia"
    }
];

// Mengisi data awal hanya jika tabel masih kosong.
const seedProduk = async () => {
    if ((await Produk.count()) === 0) {
        await Produk.bulkCreate(dataAwal);
        console.log('Data awal produk berhasil dimasukkan ke database.');
    }
};

module.exports = seedProduk;