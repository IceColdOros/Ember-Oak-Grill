const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM testimonial ORDER BY displayOrder ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching testimonials:', err.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

module.exports = router;