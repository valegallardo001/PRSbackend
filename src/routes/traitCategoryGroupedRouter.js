const express = require("express");
const router = express.Router();

// Importar el controlador que agrupa las categorías por nombre
const {
  getGroupedTraitCategories,
} = require("../controllers/traitCategoryGroupedCcontroller");

// Ruta: GET /api/trait-categories/grouped
router.get("/trait-categories/grouped", getGroupedTraitCategories);

module.exports = router;
