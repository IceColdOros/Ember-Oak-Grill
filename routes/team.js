// ============================================================
//  routes/team.js
//  Handles: GET all team members
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all team members
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM team_member ORDER BY memberId ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching team members:', err.message);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

module.exports = router;