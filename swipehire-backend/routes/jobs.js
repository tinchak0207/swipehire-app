import express from 'express';
const router = express.Router();

// Job routes
router.get('/', (req, res) => {
  res.json({ message: 'Jobs endpoint - GET all jobs' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Jobs endpoint - GET job ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Jobs endpoint - CREATE job', data: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Jobs endpoint - UPDATE job ${req.params.id}`, data: req.body });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Jobs endpoint - DELETE job ${req.params.id}` });
});

export default router;