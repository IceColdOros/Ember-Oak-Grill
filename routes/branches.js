// ============================================================
//  routes/branches.js
//  Handles: GET all branches — main branch first
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all branches — main branch shown first
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM branch ORDER BY isMainBranch DESC, name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching branches:', err.message);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

module.exports = router;