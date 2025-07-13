// Simple username-based auth middleware (placeholder for JWT)
const requireUsername = (req, res, next) => {
  if (!req.body.username) {
    return res.status(401).json({ message: 'Username required' });
  }
  next();
};

module.exports = { requireUsername };
