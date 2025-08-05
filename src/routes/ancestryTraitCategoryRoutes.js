const express = require('express');
const router = express.Router();
const controller = require('../controllers/ancestryTraitCategoryController');
/**
 * @swagger
 * /api/ancestry-trait-categories:
 *   get:
 *     summary: Obtener categorías de rasgos (trait categories) según ancestries seleccionadas
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
 *         description: Lista de categorías de rasgos con sus traits relacionados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   label:
 *                     type: string
 *                     example: "Cardiovascular Traits"
 *                   traits:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 101
 *                         label:
 *                           type: string
 *                           example: "Coronary artery disease"
 *                         description:
 *                           type: string
 *                           example: "A condition characterized by narrowing of the coronary arteries"
 *       400:
 *         description: Faltan parámetros necesarios
 *       500:
 *         description: Error interno del servidor
 */

router.get('/', controller.getTraitCategoriesByAncestries);


module.exports = router;
