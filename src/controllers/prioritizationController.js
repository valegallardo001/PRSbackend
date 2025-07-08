// src/controllers/prioritizationController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function prioritizePRSModels(req, res) {
    try {
        const { selectedTraitIds, mainAncestrySymbol } = req.body;

        if (!selectedTraitIds?.length || !mainAncestrySymbol) {
            return res.status(400).json({ error: "Datos de entrada incompletos" });
        }

        // Paso 0: Convertir cualquier ID válido a traitIds
        const traitRecords = await prisma.trait.findMany({
            where: {
                OR: [
                    { id: { in: selectedTraitIds.map(id => Number(id)) } },
                    { efoId: { in: selectedTraitIds } },
                    { mondoId: { in: selectedTraitIds } },
                    { hpoId: { in: selectedTraitIds } },
                    { orphaId: { in: selectedTraitIds } },
                    { otherId: { in: selectedTraitIds } },
                ],
            },
            select: { id: true },
        });

        const traitIds = traitRecords.map(trait => trait.id);
        console.log("🧬 Trait IDs obtenidos desde efoId:", traitIds);

        if (traitIds.length === 0) {
            return res.status(400).json({ error: "No se encontraron traits válidos con los IDs proporcionados." });
        }

        // Paso 1: Traer modelos sin filtros profundos
        const prsModels = await prisma.pRSModel.findMany({
            where: {
                traits: {
                    some: {
                        traitId: { in: traitIds },
                    },
                },
            },
            include: {
                modelEvaluations: {
                    include: {
                        metricEvaluations: {
                            include: { performanceMetric: true },
                        },
                        evaluationPopulationSample: {
                            include: { broadAncestryCategory: true },
                        },
                    },
                },
                broadAncestryCategories: {
                    include: { broadAncestryCategory: true },
                },
                traits: {
                    include: { trait: true },
                },
                DevelopmentPopulationSamples: true, // para obtener cohort
                publication: true, // para year y pubmed_id
            },

        });

        console.log("📊 Modelos PRS recuperados:", prsModels.length);

        // Paso 2: Filtrar en JS los que tengan [AUC o C-index] y OR
        const filteredModels = prsModels.filter(model => {
            return model.modelEvaluations.some(eval => {
                const metrics = eval.metricEvaluations;
                const hasAUC = metrics.some(m =>
                    ["AUC", "C-index"].includes(m.performanceMetric?.nameShort) &&
                    m.estimate !== null
                );
                const hasOR = metrics.some(m =>
                    m.performanceMetric?.nameShort === "OR" &&
                    m.estimate !== null
                );
                return hasAUC && hasOR;
            });
        });

        console.log("✅ Modelos filtrados:", filteredModels.length);

        // Paso 3: Calcular score de priorización
        const scoredModels = [];

        for (const model of filteredModels) {
            console.log(`🔍 Procesando modelo: ${model.id} (${model.name})`);

            // Paso 1: Seleccionar la MetricEvaluation con ancestría coincidente
            const evalsWithMatchingAncestry = model.modelEvaluations.filter(evaluation =>
                evaluation.evaluationPopulationSample?.broadAncestryCategory?.symbol === mainAncestrySymbol
            );

            if (evalsWithMatchingAncestry.length === 0) {
                console.log(`⚠️ Modelo ${model.id} descartado: no hay evaluación con ancestría ${mainAncestrySymbol}`);
                continue;
            }

            // Si hay varias evaluaciones, elegir la de mayor AUC
            const bestEvaluation = evalsWithMatchingAncestry.reduce((best, current) => {
                const bestAUC = best.metricEvaluations.find(m => m.performanceMetric.nameShort === "AUC")?.estimate || 0;
                const currentAUC = current.metricEvaluations.find(m => m.performanceMetric.nameShort === "AUC")?.estimate || 0;
                return currentAUC > bestAUC ? current : best;
            });

            // Evaluaciones internas (OR y AUC)
            const metricMap = {};
            bestEvaluation.metricEvaluations.forEach(me => {
                if (me.performanceMetric?.nameShort) {
                    metricMap[me.performanceMetric.nameShort] = me.estimate;
                }
            });

            const auc = metricMap["AUC"] ?? metricMap["C-index"] ?? 0;
            const or = metricMap["OR"] ?? 0;

            // Puntaje por ancestría (BroadAncestryInModel)
            const ancestryInfo = model.broadAncestryCategories.find(item =>
                item.broadAncestryCategory?.symbol === mainAncestrySymbol
            );
            console.log("🔎 Ancestry Info:", ancestryInfo);

            const ancestryPercent = ancestryInfo?.percentage || 0;
            const ancestryScore = ancestryPercent >= 85 ? 1 :
                ancestryPercent >= 70 ? 0.5 :
                    ancestryPercent >= 50 ? 0.2 : 0.1;

            // Puntaje AUC
            const aucScore = auc >= 0.85 ? 1 :
                auc >= 0.69 ? 0.5 :
                    auc >= 0.51 ? 0.2 : 0;

            // Puntaje OR
            const orScore = or > 3 ? 1 :
                or >= 2 ? 0.5 :
                    or >= 1.16 ? 0.2 : 0;

            const finalScore = 0.6 * ancestryScore + 0.3 * aucScore + 0.1 * orScore;

            console.log(`✅ Modelo ${model.id} puntuado: Ancestry=${ancestryScore}, AUC=${aucScore}, OR=${orScore} ➤ Score=${finalScore.toFixed(3)}`);

            scoredModels.push({
                modelId: model.id,
                pgscId: model.pgscId,
                name: `${model.traits?.[0]?.trait?.label || "—"}`,
                //name: `${model.traits?.[0]?.trait?.label || "—"} - ${model.traits?.[0]?.trait?.description || ""}`,
                ancestryScore,
                aucScore,
                orScore,
                finalScore: Number(finalScore.toFixed(3)),

                // CAMPOS PARA LA TABLA
                trait_label: model.traits?.[0]?.trait?.label || "—",
                ancestry: model.broadAncestryCategories
                    .map((b) => {
                        const symbol = b.broadAncestryCategory?.symbol || "";
                        const label = b.broadAncestryCategory?.label || "";
                        const pct = b.percentage != null ? `${b.percentage}%` : "";
                        return `${symbol} (${label}) ${pct}`;

                    })
                    .join(", ") || "—",

                num_snps: model.numberOfSNP || "—",
                dev_sample: model.DevelopmentPopulationSamples?.reduce((sum, sample) => {
                    return sum + (sample.numberOfIndividuals || 0);
                }, 0) || "—",

                eval_ancestry: bestEvaluation?.evaluationPopulationSample?.broadAncestryCategory?.label || "—",
                reported_trait: bestEvaluation?.reportedTrait || "—",
                year: model.publication?.year || "—",
                pubmed_id: model.publication?.PMID || "—",
            });

        }

        scoredModels.sort((a, b) => b.finalScore - a.finalScore);
        console.log("🏁 Modelos puntuados:", scoredModels.length);
        console.log("✅ Contenido de scoredModels:", scoredModels);
        return res.json(scoredModels);


    } catch (error) {
        console.error("Error en priorización:", error);
        return res.status(500).json({ error: "Error interno en la priorización" });
    }
}

module.exports = {
    prioritizePRSModels,
};
