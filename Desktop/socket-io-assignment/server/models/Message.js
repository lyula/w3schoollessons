const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for group messages
  content: { type: String, required: true },
  room: { type: String, default: 'global' }, // 'global' for group chat, or room id for private
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  read: { type: Boolean, default: false },
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reaction: String }],
  lastSeen: { type: Date }, // Only for private messages
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
