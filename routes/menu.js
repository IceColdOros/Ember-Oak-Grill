const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all menu items with their category names
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        mi.itemId,
        mi.name,
        mi.description,
        mi.price,
        mi.imagePath,
        mi.dietaryTags,
        mi.isAvailable,
        mc.name AS category
      FROM menu_item mi
      JOIN menu_category mc ON mi.categoryId = mc.categoryId
      ORDER BY mc.displayOrder, mi.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu items:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

module.exports = router;
