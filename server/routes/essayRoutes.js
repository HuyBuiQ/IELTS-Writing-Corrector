const express = require('express');
const router = express.Router();
const { checkEssay } = require('../controllers/aiController');

// Định nghĩa: POST http://localhost:5000/api/essay/check
router.post('/check', checkEssay);

module.exports = router;