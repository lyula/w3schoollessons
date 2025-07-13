const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Send a message (group or private)
const sendMessage = async (req, res) => {
  const { sender, receiver, content, room, type } = req.body;
  if (!sender || !content) return res.status(400).json({ message: 'Sender and content required' });
  try {
    const message = new Message({ sender, receiver, content, room, type });
    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get paginated messages for a room, grouped by day
const getMessages = async (req, res) => {
  const { room = 'global', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    // Aggregate messages grouped by day
    const messages = await Message.aggregate([
      { $match: { room } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $addFields: {
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          }
        }
      },
      {
        $group: {
          _id: "$day",
          messages: { $push: "$ROOT" }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendMessage, getMessages };
