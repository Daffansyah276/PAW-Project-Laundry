const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notifikasi = sequelize.define('Notifikasi', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    pesan: { type: DataTypes.STRING, allowNull: false },
    dibaca: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'notifikasi' });

module.exports = { Notifikasi, findByUser: (userId) => Notifikasi.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 10 }) };
