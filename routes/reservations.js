const express = require('express');
const router = express.Router();

// temp placeholder
router.get('/', (req, res) => {
  res.json({ message: 'Reservations route working' });
});

module.exports = router;