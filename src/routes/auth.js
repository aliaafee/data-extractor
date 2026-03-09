const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// GET /api/auth/setup — public, returns whether the first-run setup is needed
router.get('/setup', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const count = await prisma.user.count();
    res.json({ setupRequired: count === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function userView(user) {
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
}

/**
 * POST /api/auth/register
 * - Open (no auth) when the database has no users yet (bootstraps the first admin).
 * - Requires admin JWT for all subsequent registrations.
 * - Admins can optionally pass { role: "admin" } to create another admin.
 */
router.post('/register', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const userCount = await prisma.user.count();

    if (userCount > 0) {
      // Not the first user — require admin auth
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => (err ? reject(err) : resolve()));
      }).catch(() => null);

      // requireAdmin already sent a response on failure; bail out
      if (res.headersSent) return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // First user always becomes admin; subsequent users default to "user"
    // unless an admin explicitly sets role to "admin"
    const assignedRole = userCount === 0 ? 'admin' : (role === 'admin' ? 'admin' : 'user');

    const user = await prisma.user.create({
      data: { email, password: hashed, role: assignedRole },
    });

    const token = signToken(user);
    res.status(201).json({ user: userView(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ user: userView(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    res.json(userView(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users  — admin only
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/users/:id/role  — admin only
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'role must be "admin" or "user"' });
    }
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
    });
    res.json(userView(user));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
