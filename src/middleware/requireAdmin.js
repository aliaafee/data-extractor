const authenticate = require('./auth');

module.exports = function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};
