const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────
// middleware runs on every request before it reaches your routes

app.use(cors());                                  // allow frontend to talk to backend
app.use(express.json());                          // parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));  // parse form data
app.use(express.static(path.join(__dirname, 'public'))); // serve HTML/CSS/JS files

// ── ROUTES ───────────────────────────────────────────────────
// import and use route files (we will create these as we build each feature)
const reservationRoutes = require('./routes/reservations');
const contactRoutes = require('./routes/contact');
const menuRoutes = require('./routes/menu');

app.use('/api/reservations', reservationRoutes);  // e.g. POST /api/reservations
app.use('/api/contact', contactRoutes);           // e.g. POST /api/contact
app.use('/api/menu', menuRoutes);                 // e.g. GET  /api/menu

// ── CATCH-ALL ROUTE ──────────────────────────────────────────
// for any route not matched above, serve index.html
// this means navigating to /menu still loads the app
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🔥 Ember and Oak Grill server running on http://localhost:${PORT}`);
});