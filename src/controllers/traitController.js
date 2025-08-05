const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTraits = async (req, res) => {
  try {
    const traits = await prisma.trait.findMany({
      include: {
        prsModels: {
          select: { prsModelId: true } // tabla intermedia PRSModelToTrait
        }
      }
    });

    const result = traits.map((trait) => ({
      id: trait.id,
      label: trait.label,
      description: trait.description,
      URL: trait.URL,
      efoId: trait.efoId,
      mondoId: trait.mondoId,
      hpoId: trait.hpoId,
      orphaId: trait.orphaId,
      pgss: trait.prsModels.length // 👈 número real de modelos PRS asociados
    }));

    res.json(result);
  } catch (error) {
    console.error("Error al obtener traits:", error);
    res.status(500).json({ error: "Error al obtener los traits" });
  }
};


exports.getTraitsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // ← CAMBIADO: antes era req.query

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de 'ids'" });
    }

    const idArray = ids.map((id) => parseInt(id, 10));

    const traits = await prisma.trait.findMany({
      where: {
        id: {
          in: idArray,
        },
      },
      include: {
        prsModels: {
          select: { prsModelId: true },
        },
      },
    });

    const result = traits.map((trait) => ({
      id: trait.id,
      label: trait.label,
      description: trait.description,
      URL: trait.URL,
      efoId: trait.efoId,
      mondoId: trait.mondoId,
      hpoId: trait.hpoId,
      orphaId: trait.orphaId,
      pgss: trait.prsModels.length,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en getTraitsByIds:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

