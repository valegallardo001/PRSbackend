const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /api/trait-categories/grouped
 * ---------------------------------
 * • Parámetro opcional: ?ancestries=EUR,AFR
 * • Devuelve categorías agrupadas por nombre (label) con sus traits
 *   (cada trait incluye descripción y IDs ontológicos).
 */
exports.getGroupedTraitCategories = async (req, res) => {
  try {
    /* 1) Leer parámetro ancestries */
    const ancestriesParam = req.query.ancestries;
    const ancestrySymbols = ancestriesParam
      ? ancestriesParam
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];

    /* 2) Buscar modelos PRS filtrados */
    const prsModels = await prisma.pRSModel.findMany({
      where: ancestrySymbols.length
        ? {
            broadAncestryCategories: {
              some: { broadAncestryCategory: { symbol: { in: ancestrySymbols } } },
            },
          }
        : {},
      select: {
        pgscId: true,
        traits: { select: { traitId: true } },
      },
    });

    /* 3) Mapear traitId -> Set de modelos */
    const traitIdToPrsSet = {};
    prsModels.forEach(({ pgscId, traits }) => {
      traits.forEach(({ traitId }) => {
        if (!traitIdToPrsSet[traitId]) traitIdToPrsSet[traitId] = new Set();
        traitIdToPrsSet[traitId].add(pgscId);
      });
    });

    const traitIds = Object.keys(traitIdToPrsSet).map(Number);
    if (traitIds.length === 0) return res.json([]); // no hay resultados

    /* 4) Obtener traits + categorías + descripción + IDs ontológicos */
    const traits = await prisma.trait.findMany({
      where: { id: { in: traitIds } },
      select: {
        id: true,
        label: true,
        description: true,
        efoId: true,
        mondoId: true,
        hpoId: true,
        orphaId: true,
        otherId: true,
        categories: {
          select: { traitCategory: { select: { label: true } } },
        },
      },
    });

    /* 5) Agrupar por nombre de categoría */
    const categoryMap = {};

    traits.forEach((trait) => {
      const prsCount = traitIdToPrsSet[trait.id].size;

      trait.categories.forEach(({ traitCategory }) => {
        const catLabel = traitCategory.label.trim();

        if (!categoryMap[catLabel]) {
          categoryMap[catLabel] = {
            label: catLabel,
            traits: [],
            totalPrs: 0,
            traitIdsSet: new Set(), // evita duplicar traits
          };
        }

        if (!categoryMap[catLabel].traitIdsSet.has(trait.id)) {
          categoryMap[catLabel].traits.push({
            id: trait.id,
            label: trait.label,
            description: trait.description,
            efoId: trait.efoId,
            mondoId: trait.mondoId,
            hpoId: trait.hpoId,
            orphaId: trait.orphaId,
            otherId: trait.otherId,
            prsCount,
          });
          categoryMap[catLabel].traitIdsSet.add(trait.id);
          categoryMap[catLabel].totalPrs += prsCount;
        }
      });
    });

    /* 6) Formatear respuesta ordenada alfabéticamente */
    const response = Object.values(categoryMap)
      .map(({ traitIdsSet, ...cat }) => ({
        ...cat,
        traits: cat.traits.sort((a, b) => a.label.localeCompare(b.label, "en")),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "en"));

    return res.json(response);
  } catch (error) {
    console.error("❌ Error en getGroupedTraitCategories:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};
