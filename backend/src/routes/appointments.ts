import express from 'express';

const router = express.Router();

// GET /api/appointments
router.get('/', (req, res) => {
  res.json({ message: 'Get appointments' });
});

// POST /api/appointments
router.post('/', (req, res) => {
  res.json({ message: 'Schedule appointment' });
});

// PUT /api/appointments/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Update appointment' });
});

// DELETE /api/appointments/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Cancel appointment' });
});

export default router;
