// src/routes/prioritizationRoutes.js
const express = require('express');
const router = express.Router();
const { prioritizePRSModels, suggestAncestries } = require('../controllers/prioritizationController');

router.post('/prioritize', prioritizePRSModels);
router.post("/suggest-ancestries", suggestAncestries);
module.exports = router;
