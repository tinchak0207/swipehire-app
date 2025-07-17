import express from 'express';
const router = express.Router();

// Diary routes
router.get('/', (req, res) => {
  res.json({ message: 'Diary endpoint - GET all diary entries' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Diary endpoint - GET diary ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Diary endpoint - CREATE diary entry', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Diary endpoint - UPDATE diary ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Diary endpoint - DELETE diary ${req.params.id}` });
});

export default router;