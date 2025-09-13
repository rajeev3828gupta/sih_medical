import express from 'express';

const router = express.Router();

// GET /api/doctors
router.get('/', (req, res) => {
  res.json({ message: 'Get available doctors' });
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Get doctor details' });
});

export default router;
