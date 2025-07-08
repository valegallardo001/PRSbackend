const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Documentación de la API",
      version: "1.0.0",
      description: "API para gestionar ancestrías, traits y categorías de traits.",
    },
    tags: [
      { name: "Broad Ancestry", description: "Operaciones relacionadas con las ancestrías amplias" },
      { name: "Trait Category", description: "Categorías de traits con conteo de modelos" },
      { name: "Traits", description: "Listado de traits disponibles" }
    ],
    components: {
      schemas: {
        BroadAncestryCategory: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            label: { type: "string", example: "European" },
            symbol: { type: "string", example: "EUR" }
          }
        },
        TraitCategory: {
          type: "object",
          properties: {
            id: { type: "integer", example: 33 },
            name: { type: "string", example: "Biological process" },
            traits: {
              type: "array",
              items: { type: "integer" },
              example: [728, 743, 825]
            },
            pgss: { type: "integer", example: 37 }
          }
        },
        Trait: {
          type: "object",
          properties: {
            id: { type: "integer", example: 717 },
            label: { type: "string", example: "Abdominal Aortic Aneurysm" },
            description: { type: "string", example: "Enlargement of the abdominal artery..." },
            URL: { type: "string", example: "http://www.ebi.ac.uk/efo/EFO_0004214" },
            efoId: { type: "string", example: "EFO_0004214" },
            mondoId: { type: "string", nullable: true },
            hpoId: { type: "string", nullable: true },
            orphaId: { type: "string", nullable: true }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
