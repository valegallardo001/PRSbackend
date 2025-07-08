// src/routes/prioritizationRoutes.js
const express = require('express');
const router = express.Router();
const { prioritizePRSModels } = require('../controllers/prioritizationController');

router.post('/prioritize', prioritizePRSModels);

module.exports = router;
