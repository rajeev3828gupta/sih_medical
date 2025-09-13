import express from 'express';

const router = express.Router();

// POST /api/sync/offline-events
router.post('/offline-events', (req, res) => {
  res.json({ message: 'Sync offline events' });
});

export default router;
