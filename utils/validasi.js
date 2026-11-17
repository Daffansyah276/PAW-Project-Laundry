// Mengubah parameter :id menjadi angka, mengembalikan null jika tidak valid.
exports.parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// Memeriksa dan merapikan body request untuk produk.
// Hasil: { error } jika tidak valid, atau { data } jika valid.
exports.validasiProduk = (body = {}) => {
    const nama = String(body.nama || '').trim();
    const harga = Number(body.harga);

    if (!nama) {
        return { error: 'Nama layanan wajib diisi.' };
    }
    if (body.harga === undefined || body.harga === null || body.harga === '' || !Number.isInteger(harga) || harga < 0) {
        return { error: 'Harga harus berupa bilangan bulat dan tidak boleh negatif.' };
    }

    return {
        data: {
            nama,
            deskripsi: String(body.deskripsi || '').trim(),
            kategori: String(body.kategori || '').trim() || 'Layanan Kiloan',
            harga,
            stok: String(body.stok || '').trim() || 'Tersedia'
        }
    };
};