import express from 'express';
const router = express.Router();

// User routes
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - GET all users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Users endpoint - GET user ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Users endpoint - CREATE user', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Users endpoint - UPDATE user ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Users endpoint - DELETE user ${req.params.id}` });
});

export default router;