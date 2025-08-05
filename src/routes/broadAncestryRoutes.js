// src/routes/broadAncestryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/broadAncestryController');
/**
 * @swagger
 * /api/ancestries:
 *   get:
 *     summary: Obtener todas las categorías de ancestría
 *     tags: [Broad Ancestry]
 *     responses:
 *       200:
 *         description: Lista de categorías de ancestría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BroadAncestryCategory'
 *       500:
 *         description: Error interno al obtener las categorías
 */



router.get('/', controller.getAllBroadAncestry);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     BroadAncestryCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         label:
 *           type: string
 *           example: "European"
 *         symbol:
 *           type: string
 *           example: "EUR"
 */
