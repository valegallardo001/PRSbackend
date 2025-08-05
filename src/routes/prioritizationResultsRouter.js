// routes/prioritizationResultsRouter.js
const express = require('express');
const { getPrioritizedModels } = require('../controllers/prioritizationResultsController');

const router = express.Router();

router.get('/results', getPrioritizedModels);

module.exports = router;
