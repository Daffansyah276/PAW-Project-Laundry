const dataProduk = [
    { 
        id: 1, 
        nama: "Cuci Komplit Reguler", 
        deskripsi: "Cuci, kering, dan setrika rapi. Selesai dalam 2 hari.", 
        kategori: "Layanan Kiloan",
        harga: 6000, 
        stok: "Tersedia" 
    },
    { 
        id: 2, 
        nama: "Cuci Komplit Ekspres", 
        deskripsi: "Cuci, kering, dan setrika kilat. Selesai dalam 1 hari.", 
        kategori: "Layanan Kiloan",
        harga: 10000, 
        stok: "Tersedia" 
    },
    { 
        id: 3, 
        nama: "Setrika Saja", 
        deskripsi: "Pakaian disetrika rapi dan wangi. Selesai dalam 1 hari.", 
        kategori: "Layanan Kiloan",
        harga: 4000, 
        stok: "Tersedia" 
    }
];

module.exports = {
    getAll: () => dataProduk
};