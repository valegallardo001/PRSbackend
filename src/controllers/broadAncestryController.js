//BroadancestryCategory 

// src/controllers/broadAncestryController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBroadAncestry = async (req, res) => {
  try {
    const ancestries = await prisma.broadAncestryCategory.findMany();

    res.json(ancestries);
  } catch (error) {
    console.error("Error al obtener BroadAncestryCategory:", error);
    res.status(500).json({ error: "Error al obtener las categorías de ancestría" });
  }
};
