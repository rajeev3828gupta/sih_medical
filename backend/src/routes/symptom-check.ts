import express from 'express';

const router = express.Router();

// POST /api/symptom-check
router.post('/', (req, res) => {
  res.json({ message: 'Symptom check analysis' });
});

export default router;
