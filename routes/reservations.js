// ============================================================
//  routes/reservations.js
//  Handles: GET all reservations, POST new reservation
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET all reservations ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reservation ORDER BY date ASC, time ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// ── POST new reservation ──────────────────────────────────
router.post('/', async (req, res) => {
  // Destructure all fields from the request body
  const {
    reservationId,
    guestName,
    email,
    phone,
    date,
    time,
    partySize,
    specialRequests,
  } = req.body;

  // Server-side validation — never trust only client-side validation
  if (!guestName || !email || !phone || !date || !time || !partySize) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Validate email format on server too
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Validate date is not in the past
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return res.status(400).json({ error: 'Reservation date must be in the future' });
  }

  try {
    // Insert into the database using a parameterised query
    // The ? placeholders prevent SQL injection attacks
    await db.query(
      `INSERT INTO reservation 
        (reservationId, guestName, email, phone, date, time, partySize, specialRequests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [reservationId, guestName, email, phone, date, time, partySize, specialRequests || null]
    );

    // Send back a success response
    res.status(201).json({
      message: 'Reservation created successfully',
      reservationId,
    });

  } catch (err) {
    console.error('Error creating reservation:', err.message);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

module.exports = router;