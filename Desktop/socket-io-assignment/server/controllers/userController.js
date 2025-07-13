const User = require('../models/User');

const registerUser = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(409).json({ message: 'Username already taken' });
    user = new User({ username });
    await user.save();
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username online avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, getUsers };
