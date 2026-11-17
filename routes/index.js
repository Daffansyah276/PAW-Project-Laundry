const express = require('express');
const router = express.Router();
const webRoutes = require('./web');
const apiRoutes = require('./api');
const chatRoutes = require('./chat.routes');
const authRoutes = require('./auth.routes');

router.use('/', webRoutes);
router.use('/api', apiRoutes);
router.use('/api', chatRoutes);
router.use('/', authRoutes);

module.exports = router;
