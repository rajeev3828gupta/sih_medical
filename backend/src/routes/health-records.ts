import express from 'express';

const router = express.Router();

// GET /api/health-records
router.get('/', (req, res) => {
  res.json({ message: 'Get health records' });
});

// POST /api/health-records
router.post('/', (req, res) => {
  res.json({ message: 'Add health record' });
});

export default router;
