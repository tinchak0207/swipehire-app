import express from 'express';
const router = express.Router();

// Match routes
router.get('/', (req, res) => {
  res.json({ message: 'Matches endpoint - GET all matches' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Matches endpoint - GET match ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Matches endpoint - CREATE match', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Matches endpoint - UPDATE match ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Matches endpoint - DELETE match ${req.params.id}` });
});

export default router;