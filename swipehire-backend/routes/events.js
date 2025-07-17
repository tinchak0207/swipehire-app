import express from 'express';
const router = express.Router();

// Events routes
router.get('/', (req, res) => {
  res.json({ message: 'Events endpoint - GET all events' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Events endpoint - GET event ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Events endpoint - CREATE event', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Events endpoint - UPDATE event ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Events endpoint - DELETE event ${req.params.id}` });
});

export default router;