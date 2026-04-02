// ============================================================
//  routes/contact.js
//  Handles: POST contact enquiry — saves to database
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET placeholder
router.get('/', (req, res) => {
  res.json({ message: 'Contact route working' });
});

// POST new contact enquiry
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Server-side validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters' });
  }

  try {
    // Insert enquiry into database
    // enquiryId is AUTO_INCREMENT so we don't need to provide it
    await db.query(
      `INSERT INTO contact_enquiry (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), subject, message.trim()]
    );

    res.status(201).json({ message: 'Enquiry submitted successfully' });

  } catch (err) {
    console.error('Error saving contact enquiry:', err.message);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

module.exports = router;