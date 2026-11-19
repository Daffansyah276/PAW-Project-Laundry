const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const pesananController = require('../controllers/pesanan.controller');

router.get('/', homeController.index);
router.get('/kelola', requireAdmin, homeController.kelola);
router.get('/chatbot', homeController.chatbot);
router.get('/login', homeController.login);
router.get('/register', homeController.register);
router.get('/pesanan/baru', requireAuth, pesananController.newForm);
router.post('/pesanan', requireAuth, pesananController.create);
router.get('/pesanan-saya', requireAuth, pesananController.myOrders);
router.get('/admin/pesanan', requireAdmin, pesananController.adminOrders);
router.post('/admin/pesanan/:id/status', requireAdmin, pesananController.updateStatus);

module.exports = router;
