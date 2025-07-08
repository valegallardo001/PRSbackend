const express = require('express');
const router = express.Router();
const controller = require('../controllers/ancestryTraitCategoryController');
/**
 * @swagger
 * /api/ancestry-trait-categories:
 *   get:
 *     summary: Obtener trait categories según ancestries seleccionadas
 *     tags:
 *       - Trait Categories
 *     parameters:
 *       - in: query
 *         name: ancestries
 *         schema:
 *           type: string
 *         required: true
 *         description: "Lista separada por comas de símbolos de ancestría, por ejemplo: EUR, AFR, SAS"
 *     responses:
 *       200:
 *         description: Lista de trait categories y sus traits relacionados
 *       400:
 *         description: Faltan parámetros necesarios
 *       500:
 *         description: Error interno del servidor
 */


router.get('/', controller.getTraitCategoriesByAncestries);


module.exports = router;
