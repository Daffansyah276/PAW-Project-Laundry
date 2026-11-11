const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produk = sequelize.define('Produk', {
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    kategori: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Layanan Kiloan'
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stok: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Tersedia'
    }
}, {
    tableName: 'produk'
});

// Semua operasi database untuk produk ada di sini, controller tinggal memanggil.
module.exports = {
    Produk,
    getAll: () => Produk.findAll({ order: [['id', 'ASC']] }),
    getById: (id) => Produk.findByPk(id),
    create: (data) => Produk.create(data),
    update: async (id, data) => {
        const item = await Produk.findByPk(id);
        if (!item) return null;
        return item.update(data);
    },
    remove: async (id) => {
        const item = await Produk.findByPk(id);
        if (!item) return false;
        await item.destroy();
        return true;
    },
    count: () => Produk.count(),
    bulkCreate: (rows) => Produk.bulkCreate(rows)
};