import express from 'express';

const router = express.Router();

// GET /api/consultations
router.get('/', (req, res) => {
  res.json({ message: 'Get consultations' });
});

// POST /api/consultations/:id/start
router.post('/:id/start', (req, res) => {
  res.json({ message: 'Start consultation' });
});

// POST /api/consultations/:id/end
router.post('/:id/end', (req, res) => {
  res.json({ message: 'End consultation' });
});

// POST /api/consultations/:id/messages
router.post('/:id/messages', (req, res) => {
  res.json({ message: 'Send message' });
});

export default router;
