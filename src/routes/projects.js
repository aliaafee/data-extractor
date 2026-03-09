const { Router } = require('express');

const router = Router();

const parseSchema = (project) => {
  if (!project) return project;
  return {
    ...project,
    extractionSchema: project.extractionSchema ? JSON.parse(project.extractionSchema) : null,
  };
};

// GET /api/projects - list projects owned by or shared with the user
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const projects = await prisma.project.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    res.json(projects.map(parseSchema));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const project = await prisma.project.findFirst({
      where: { id: Number(req.params.id), ownerId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(parseSchema(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, systemPrompt, userPromptTemplate, extractionSchema } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const project = await prisma.project.create({
      data: {
        name,
        systemPrompt,
        userPromptTemplate,
        extractionSchema: extractionSchema != null ? JSON.stringify(extractionSchema) : undefined,
        ownerId: req.userId,
      },
    });
    res.status(201).json(parseSchema(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, systemPrompt, userPromptTemplate, extractionSchema } = req.body;
    const existing = await prisma.project.findFirst({
      where: { id: Number(req.params.id), ownerId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        systemPrompt,
        userPromptTemplate,
        extractionSchema: extractionSchema != null ? JSON.stringify(extractionSchema) : undefined,
      },
    });
    res.json(parseSchema(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const existing = await prisma.project.findFirst({
      where: { id: Number(req.params.id), ownerId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    await prisma.project.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Items nested under a project ──────────────────────────────────────────────

// GET /api/projects/:projectId/items
router.get('/:projectId/items', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const items = await prisma.processedItem.findMany({
      where: { projectId, userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:projectId/items
router.post('/:projectId/items', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { sourceText, resultJSON } = req.body;
    if (!sourceText) return res.status(400).json({ error: 'sourceText is required' });
    const item = await prisma.processedItem.create({
      data: { sourceText, resultJSON, userId: req.userId, projectId },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:projectId/items/:id
router.patch('/:projectId/items/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const projectId = Number(req.params.projectId);
    const existing = await prisma.processedItem.findFirst({
      where: { id: Number(req.params.id), projectId, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const { sourceText, resultJSON, done } = req.body;
    const item = await prisma.processedItem.update({
      where: { id: Number(req.params.id) },
      data: { sourceText, resultJSON, done },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:projectId/items/:id
router.delete('/:projectId/items/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const projectId = Number(req.params.projectId);
    const existing = await prisma.processedItem.findFirst({
      where: { id: Number(req.params.id), projectId, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.processedItem.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
