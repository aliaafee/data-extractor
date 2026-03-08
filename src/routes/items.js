const { Router } = require('express');

const router = Router();

// GET /api/items - list all items
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const items = await prisma.item.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id - get a single item
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const item = await prisma.item.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items - create a new item
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const item = await prisma.item.create({
      data: { title, description, userId: req.userId },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/items/:id - update an item
router.patch('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { title, description, done } = req.body;
    const existing = await prisma.item.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.item.update({
      where: { id: Number(req.params.id) },
      data: { title, description, done },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id - delete an item
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const existing = await prisma.item.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.item.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
