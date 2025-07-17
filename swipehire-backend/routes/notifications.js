import express from 'express';
const router = express.Router();

// Notifications routes
router.get('/', (req, res) => {
  res.json({ message: 'Notifications endpoint - GET all notifications' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Notifications endpoint - GET notification ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Notifications endpoint - CREATE notification', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Notifications endpoint - UPDATE notification ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Notifications endpoint - DELETE notification ${req.params.id}` });
});

export default router;