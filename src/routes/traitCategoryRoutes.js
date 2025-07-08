//src/routes/traitCategoryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/traitCategoryController');


/**
 * @swagger
 * /api/trait-categories:
 *   get:
 *     summary: Obtener todas las trait categories con su conteo de modelos
 *     tags: [Trait Category]
 *     responses:
 *       200:
 *         description: Lista de trait categories con sus traits y número de modelos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TraitCategory'
 */
router.get('/', controller.getTraitCategoriesWithPGSCount);
module.exports = router;
