// src/routes/prioritizationRoutes.js
const express = require('express');
const router = express.Router();
const { prioritizePRSModels, suggestAncestries, insertPrioritizedModels} = require('../controllers/prioritizationController');
/**
 * @swagger
 * /api/prioritization/prioritize:
 *   post:
 *     summary: Prioriza modelos PRS según traits seleccionados y una ancestría principal
 *     tags: [Prioritization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedTraitIds
 *               - mainAncestrySymbol
 *             properties:
 *               selectedTraitIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [101, 102]
 *               mainAncestrySymbol:
 *                 type: string
 *                 example: "EUR"
 *     responses:
 *       200:
 *         description: Lista de modelos PRS priorizados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   modelId:
 *                     type: integer
 *                   pgscId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   ancestryScore:
 *                     type: number
 *                   or:
 *                     type: number
 *                   auroc:
 *                     type: number
 *                   finalScore:
 *                     type: number
 *                   trait_label:
 *                     type: string
 *                   ancestry:
 *                     type: string
 *                   num_snps:
 *                     type: integer
 *                   dev_sample:
 *                     type: integer
 *                   eval_ancestry:
 *                     type: string
 *                   reported_trait:
 *                     type: string
 *                   year:
 *                     type: string
 *                   pubmed_id:
 *                     type: string
 *       400:
 *         description: Datos de entrada incompletos o no válidos
 *       500:
 *         description: Error interno en la priorización
 */

router.post('/prioritize', prioritizePRSModels);



/**
 * @swagger
 * /api/prioritization/suggest-ancestries:
 *   post:
 *     summary: Sugiere ancestrías disponibles para traits seleccionados
 *     tags: [Prioritization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedTraitIds
 *             properties:
 *               selectedTraitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["EFO_0001645", "MONDO_001"]
 *     responses:
 *       200:
 *         description: Lista de ancestrías sugeridas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symbol:
 *                     type: string
 *                     example: "EUR"
 *                   label:
 *                     type: string
 *                     example: "European"
 *       400:
 *         description: No se proporcionaron trait IDs
 *       500:
 *         description: Error interno del servidor
 */




router.post("/suggest-ancestries", suggestAncestries);

router.post("/insert-prioritized", insertPrioritizedModels);
module.exports = router;
