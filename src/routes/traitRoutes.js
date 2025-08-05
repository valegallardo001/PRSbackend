const express = require('express');
const router = express.Router();

const traitController = require('../controllers/traitController');

/**
 * @swagger
 * /api/traits:
 *   get:
 *     summary: Obtener todos los traits
 *     tags: [Traits]
 *     responses:
 *       200:
 *         description: Lista de traits disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trait'
 */


router.get('/', traitController.getAllTraits);
router.post("/by-ids", traitController.getTraitsByIds); 

module.exports = router;
