const express = require('express');
const router = express.Router();

// temp placeholder
router.get('/', (req, res) => {
  res.json({ message: 'Contact route working' });
});

module.exports = router;