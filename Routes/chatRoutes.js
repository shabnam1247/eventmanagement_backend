const express = require('express');
const router = express.Router();
const { getMessages, getRecentChats } = require('../Controllers/chatcontroller');

router.get('/messages/:userId/:targetId', getMessages);
router.get('/chats/:userId', getRecentChats);

module.exports = router;
