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
      {
        name: "Broad Ancestry",
        description: "Operaciones relacionadas con las ancestrías amplias"
      },
      {
        name: "Trait Category",
        description: "Categorías de traits con conteo de modelos"
      },
      {
        name: "Traits",
        description: "Listado de traits disponibles"
      },
      {
        name: "Prioritization",
        description: "Endpoints para priorización de modelos PRS"
      }
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
            label: { type: "string", example: "Cardiovascular" },
            traits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 101 },
                  label: { type: "string", example: "Coronary artery disease" },
                  modelCount: { type: "integer", example: 5 }
                }
              }
            }
          }
        },
        TraitCategoryGrouped: {
          type: "object",
          properties: {
            label: { type: "string", example: "Cardiovascular" },
            totalPrs: { type: "integer", example: 28 },
            traits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 101 },
                  label: { type: "string", example: "Coronary artery disease" },
                  description: { type: "string", example: "A condition affecting coronary arteries" },
                  efoId: { type: "string", example: "EFO_0001645" },
                  mondoId: { type: "string", example: "MONDO_001" },
                  hpoId: { type: "string", example: "HP_0001627" },
                  orphaId: { type: "string", example: "ORPHA:123456" },
                  otherId: { type: "string", example: "OTHER_001" },
                  prsCount: { type: "integer", example: 6 }
                }
              }
            }
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
            orphaId: { type: "string", nullable: true },
            otherId: { type: "string", nullable: true }
          }
        },
        PRSModelPrioritized: {
          type: "object",
          properties: {
            modelId: { type: "integer", example: 128 },
            pgscId: { type: "string", example: "PGS000128" },
            name: { type: "string", example: "Coronary artery disease" },
            ancestryScore: { type: "number", example: 1.0 },
            or: { type: "number", example: 2.3 },
            auroc: { type: "number", example: 0.76 },
            finalScore: { type: "number", example: 0.88 },
            trait_label: { type: "string", example: "CAD" },
            ancestry: { type: "string", example: "EUR (European) 90%" },
            num_snps: { type: "integer", example: 3251 },
            dev_sample: { type: "integer", example: 14500 },
            eval_ancestry: { type: "string", example: "European" },
            reported_trait: { type: "string", example: "Heart disease" },
            year: { type: "string", example: "2023" },
            pubmed_id: { type: "string", example: "PMID:12345678" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"] // Ruta donde Swagger buscará anotaciones @swagger
};

const swaggerSpec = require("swagger-jsdoc")(options);
module.exports = swaggerSpec;
