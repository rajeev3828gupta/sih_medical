import express from 'express';

const router = express.Router();

// GET /api/pharmacies
router.get('/', (req, res) => {
  res.json({ message: 'Get pharmacies' });
});

// GET /api/pharmacies/:id/medicines
router.get('/:id/medicines', (req, res) => {
  res.json({ message: 'Get pharmacy medicines' });
});

// GET /api/pharmacies/search-medicine
router.get('/search-medicine', (req, res) => {
  res.json({ message: 'Search medicine availability' });
});

export default router;
