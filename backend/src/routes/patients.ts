import express from 'express';

const router = express.Router();

// GET /api/patients/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get patient profile' });
});

// PUT /api/patients/profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update patient profile' });
});

export default router;
