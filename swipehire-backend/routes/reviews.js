import express from 'express';
const router = express.Router();

// Review routes
router.get('/', (req, res) => {
  res.json({ message: 'Reviews endpoint - GET all reviews' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Reviews endpoint - GET review ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Reviews endpoint - CREATE review', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Reviews endpoint - UPDATE review ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Reviews endpoint - DELETE review ${req.params.id}` });
});

export default router;