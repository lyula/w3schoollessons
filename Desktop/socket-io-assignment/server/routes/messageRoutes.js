const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

// Send a message (group or private)
router.post('/', sendMessage);
// Get messages for a room (group or private)
router.get('/', getMessages);

module.exports = router;
