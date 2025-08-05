const express = require("express");
const router = express.Router();

// Importar el controlador que agrupa las categorías por nombre
const {
  getGroupedTraitCategories,
} = require("../controllers/traitCategoryGroupedCcontroller");


/**
 * @swagger
 * /api/trait-categories/grouped:
 *   get:
 *     summary: Obtener categorías de rasgos agrupadas por nombre, con sus traits y cantidad de modelos asociados
 *     tags: [Trait Categories]
 *     parameters:
 *       - in: query
 *         name: ancestries
 *         schema:
 *           type: string
 *         required: false
 *         description: "Lista separada por comas de símbolos de ancestría (ej: EUR, AFR)"
 *     responses:
 *       200:
 *         description: Lista de categorías agrupadas con traits asociados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TraitCategoryGrouped'
 *       500:
 *         description: Error del servidor
 */

// Ruta: GET /api/trait-categories/grouped
router.get("/trait-categories/grouped", getGroupedTraitCategories);

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     TraitCategoryGrouped:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           example: "Cardiovascular"
 *         totalPrs:
 *           type: integer
 *           example: 28
 *         traits:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 101
 *               label:
 *                 type: string
 *                 example: "Coronary artery disease"
 *               description:
 *                 type: string
 *                 example: "Narrowing or blockage of the coronary arteries."
 *               efoId:
 *                 type: string
 *                 example: "EFO_0001645"
 *               mondoId:
 *                 type: string
 *                 example: "MONDO_001"
 *               hpoId:
 *                 type: string
 *                 example: "HP_0001627"
 *               orphaId:
 *                 type: string
 *                 example: "ORPHA:123456"
 *               otherId:
 *                 type: string
 *                 example: "OTHER_001"
 *               prsCount:
 *                 type: integer
 *                 example: 6
 */
