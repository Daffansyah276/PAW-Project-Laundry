const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Pesanan = sequelize.define('Pesanan', {
    kode: { type: DataTypes.STRING, allowNull: false, unique: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    namaPelanggan: { type: DataTypes.STRING, allowNull: false },
    layanan: { type: DataTypes.STRING, allowNull: false },
    hargaPerKg: { type: DataTypes.INTEGER, allowNull: false },
    berat: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    catatan: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    status: { type: DataTypes.ENUM('Dicuci', 'Kering', 'Disetrika', 'Siap Ambil', 'Diambil'), allowNull: false, defaultValue: 'Dicuci' },
    estimasiSelesai: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'pesanan' });

module.exports = {
    Pesanan,
    activeStatuses: ['Dicuci', 'Kering', 'Disetrika', 'Siap Ambil'],
    findByCustomer: (customerId) => Pesanan.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] }),
    findAll: () => Pesanan.findAll({ order: [['createdAt', 'DESC']] }),
    findActiveByCustomer: (customerId) => Pesanan.findAll({ where: { customerId, status: { [Op.ne]: 'Diambil' } }, order: [['estimasiSelesai', 'ASC']] }),
    findActive: () => Pesanan.findAll({ where: { status: { [Op.ne]: 'Diambil' } }, order: [['estimasiSelesai', 'ASC']] }),
    findById: (id) => Pesanan.findByPk(id),
};
