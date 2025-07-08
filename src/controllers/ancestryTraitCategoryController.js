const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getTraitCategoriesByAncestries = async (req, res) => {
  try {
    const { ancestries } = req.query;
    if (!ancestries) {
      return res.status(400).json({ error: "Falta el parámetro ancestries" });
    }

    const ancestrySymbols = ancestries.split(",");

    // 1. Filtrar los PRS Models válidos
    const prsModels = await prisma.pRSModel.findMany({
      where: {
        broadAncestryCategories: {
          some: {
            broadAncestryCategory: {
              symbol: { in: ancestrySymbols }
            }
          }
        }
      },
      include: {
        traits: true,
        broadAncestryCategories: {
          include: { broadAncestryCategory: true }
        }
      }
    });

    // 2. Agrupar los modelos por traitId
    const traitIdToModelCount = {};
    prsModels.forEach((model) => {
      model.traits.forEach((traitRel) => {
        const traitId = traitRel.traitId;
        if (!traitIdToModelCount[traitId]) {
          traitIdToModelCount[traitId] = new Set();
        }
        traitIdToModelCount[traitId].add(model.pgs_id);
      });
    });

    const traitIds = Object.keys(traitIdToModelCount).map(Number);

    // 3. Obtener traits con categorías
    const traits = await prisma.trait.findMany({
      where: { id: { in: traitIds } },
      include: {
        categories: {
          include: {
            traitCategory: true,
          },
        },
      },
    });

    // 4. Agrupar traits por categoría
    const categoryMap = {};

    traits.forEach((trait) => {
      trait.categories.forEach((catRel) => {
        const category = catRel.traitCategory;
        if (!categoryMap[category.id]) {
          categoryMap[category.id] = {
            id: category.id,
            label: category.label,
            traits: [],
            pgss: 0,
          };
        }
        categoryMap[category.id].traits.push(trait.id);
        categoryMap[category.id].pgss += traitIdToModelCount[trait.id].size;
      });
    });

    const response = Object.values(categoryMap);
    res.json(response);
  } catch (error) {
    console.error("Error en getTraitCategoriesByAncestries:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
