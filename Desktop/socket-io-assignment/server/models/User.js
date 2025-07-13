const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Now required for JWT auth
  online: { type: Boolean, default: false },
  avatar: { type: String },
  lastSeen: { type: Date }, // For private messaging
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
