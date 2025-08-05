const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // <- esto faltaba

async function getPrioritizedModels(req, res) {
  try {
    const results = await prisma.prioritizedModel.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(results);
  } catch (error) {
    console.error("❌ Error al obtener modelos priorizados:", error);
    res.status(500).json({ error: "Error interno al obtener modelos" });
  }
}

module.exports = { getPrioritizedModels };
