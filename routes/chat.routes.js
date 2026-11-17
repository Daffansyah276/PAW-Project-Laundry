const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const validateChatInput = require('../middlewares/validateChatInput');

// POST /api/chat - AI Assistant endpoint
router.post('/chat', validateChatInput, chatController.chat);

module.exports = router;

