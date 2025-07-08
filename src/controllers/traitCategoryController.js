const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTraitCategoriesWithPGSCount = async (req, res) => {
  try {
    const categories = await prisma.traitCategory.findMany({
      include: {
        traits: {
          include: {
            trait: {
              include: {
                prsModels: true, // Relación con PRSModelToTrait
              }
            }
          }
        }
      }
    });

    const result = categories.map((category) => {
      const traitIds = category.traits.map((ttc) => ttc.traitId);

      // Obtener todos los modelos asociados a esos traits
      const prsModelIds = category.traits.flatMap((ttc) =>
        ttc.trait.prsModels.map((pm) => pm.prsModelId)
      );

      // Eliminar duplicados
      const uniquePgsIds = [...new Set(prsModelIds)];

      return {
        id: category.id,
        name: category.label,
        traits: traitIds,
        pgss: uniquePgsIds.length,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error al obtener categorías de traits:", error);
    res.status(500).json({ error: "Error al obtener los datos." });
  }
};
