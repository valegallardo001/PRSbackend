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
                    //{ efoId: { in: selectedTraitIds } },
                    //{ mondoId: { in: selectedTraitIds } },
                    //{ hpoId: { in: selectedTraitIds } },
                    //{ orphaId: { in: selectedTraitIds } },
                    //{ otherId: { in: selectedTraitIds } },
                ],
            },
            select: { id: true },
        });

        const traitIds = traitRecords.map(trait => trait.id);
        console.log("🧬 Trait IDs obtenidos:", traitIds);

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

        //console.log("📊 Modelos PRS recuperados:", prsModels.length, prsModels);
        console.dir(prsModels, { depth: null });

        // Paso 2: Filtrar en JS los que tengan [auroc o C-index] y OR
        /*const filteredModels = prsModels.filter(model => {
            return model.modelEvaluations.some(eval => {
                const metrics = eval.metricEvaluations;
                const hasauroc = metrics.some(m =>
                    ["AUROC", "C-index"].includes(m.performanceMetric?.nameShort) &&
                    m.estimate !== null
                );
                const hasOR = metrics.some(m =>
                    m.performanceMetric?.nameShort === "OR" &&
                    m.estimate !== null
                );
                return hasauroc && hasOR;
            });
        }); */

        const filteredModels = prsModels.filter(model => {
            // Filter the evaluations of each model
            model.modelEvaluations = model.modelEvaluations.filter(eval => {
                const metrics = eval.metricEvaluations;

                const hasAUROC = metrics.some(m =>
                    ["AUROC", "C-index"].includes(m.performanceMetric?.nameShort) &&
                    m.estimate !== null
                );
                const hasOR = metrics.some(m =>
                    m.performanceMetric?.nameShort === "OR" &&
                    m.estimate !== null
                );

                if (hasAUROC && hasOR) {
                    // Keep only the metrics that meet the criteria
                    eval.metricEvaluations = metrics.filter(m =>
                        (["AUROC", "C-index"].includes(m.performanceMetric?.nameShort) ||
                            m.performanceMetric?.nameShort === "OR") &&
                        m.estimate !== null
                    );
                    return true;
                }

                return false;
            });

            // Keep only models that still have evaluations
            return model.modelEvaluations.length > 0;
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

            // Si hay varias evaluaciones, elegir la de mayor auroc
            const bestEvaluation = evalsWithMatchingAncestry.reduce((best, current) => {
                const bestAUC = best.metricEvaluations.find(m =>
                    ["AUROC", "C-index"].includes(m.performanceMetric.nameShort)
                )?.estimate || 0;

                const currentAUC = current.metricEvaluations.find(m =>
                    ["AUROC", "C-index"].includes(m.performanceMetric.nameShort)
                )?.estimate || 0;

                return currentAUC > bestAUC ? current : best;
            });


            // Evaluaciones internas (OR y auroc)
            const metricMap = {};
            bestEvaluation.metricEvaluations.forEach(me => {
                if (me.performanceMetric?.nameShort) {
                    metricMap[me.performanceMetric.nameShort] = me.estimate;
                }
            });

            const auroc = typeof metricMap["AUROC"] === "number" ? metricMap["AUROC"]
                : typeof metricMap["C-index"] === "number" ? metricMap["C-index"]
                    : null;

            const or = typeof metricMap["OR"] === "number" ? metricMap["OR"] : null;


            // Puntaje por ancestría (BroadAncestryInModel)
            const ancestryInfo = model.broadAncestryCategories.find(item =>
                item.broadAncestryCategory?.symbol === mainAncestrySymbol
            );
            console.log("🔎 Ancestry Info:", ancestryInfo);

            const ancestryPercent = ancestryInfo?.percentage || 0;
            const ancestryScore = ancestryPercent >= 85 ? 1 :
                ancestryPercent >= 70 ? 0.5 :
                    ancestryPercent >= 50 ? 0.2 : 0.1;

            // Puntaje auroc
            const aurocScore = auroc >= 0.8 ? 1 :
                auroc >= 0.7 ? 0.5 :
                    auroc >= 0.51 ? 0.2 : 0;

            // Puntaje OR
            const orScore = or > 3 ? 1 :
                or >= 2 ? 0.5 :
                    or >= 1.150 ? 0.2 : 0;

            const finalScore = 0.6 * ancestryScore + 0.3 * aurocScore + 0.1 * orScore;


            console.log(`✅ Modelo ${model.id} puntuado: Ancestry=${ancestryScore}, AUROC=${aurocScore}, OR=${orScore} ➤ Score=${finalScore.toFixed(3)}`);

            scoredModels.push({

                // CAMPOS PARA LA TABLA
                modelId: model.id,
                pgscId: model.pgscId,
                name: `${model.traits?.[0]?.trait?.label || "—"}`,
                //name: `${model.traits?.[0]?.trait?.label || "—"} - ${model.traits?.[0]?.trait?.description || ""}`,
                ancestryScore,
                or: or != null ? Number(or.toFixed(3)) : "—",
                auroc: auroc != null ? Number(auroc.toFixed(3)) : "—",



                finalScore: Number(finalScore.toFixed(3)),

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
        // Suponiendo que `prsModels` es el arreglo de modelos con finalScore, auroc, or y pgscId
        // Verifica si todos tienen el mismo finalScore
        const allSameScore = scoredModels.every(
            model => model.finalScore === scoredModels[0].finalScore
        );

        if (allSameScore) {
            scoredModels.sort((a, b) => {
                // 1. AUROC descendente
                if (b.auroc !== a.auroc) {
                    return (b.auroc ?? 0) - (a.auroc ?? 0);
                }

                // 2. OR descendente
                if (b.or !== a.or) {
                    return (b.or ?? 0) - (a.or ?? 0);
                }

                // 3. pgscId ascendente
                return a.pgscId.localeCompare(b.pgscId);
            });
        } else {
            // Orden normal por finalScore descendente
            scoredModels.sort((a, b) => b.finalScore - a.finalScore);
        }


        console.log("🏁 Modelos puntuados:", scoredModels.length);
        console.log("✅ Contenido de scoredModels:", scoredModels);
        return res.json(scoredModels);


    } catch (error) {
        console.error("Error en priorización:", error);
        return res.status(500).json({ error: "Error interno en la priorización" });
    }
}

/* ─────────────────────────────────────────────
   SUGERIR ANCESTRÍAS  (NUEVO ENDPOINT)
───────────────────────────────────────────── */
async function suggestAncestries(req, res) {
    try {
        const { selectedTraitIds } = req.body;

        if (!selectedTraitIds || selectedTraitIds.length === 0) {
            return res.status(400).json({ message: "No trait IDs provided." });
        }

        // 1. Buscar modelos que contengan CUALQUIERA de los traits enviados
        const models = await prisma.pRSModel.findMany({
            where: {
                traits: {
                    some: {
                        trait: {
                            OR: [
                                { onto_id: { in: selectedTraitIds } },
                                { efoId: { in: selectedTraitIds } },
                                { mondoId: { in: selectedTraitIds } },
                                { hpoId: { in: selectedTraitIds } },
                                { orphaId: { in: selectedTraitIds } },
                                { otherId: { in: selectedTraitIds } },
                            ],
                        },
                    },
                },
            },
            include: {
                broadAncestryCategories: {
                    include: { broadAncestryCategory: true },
                },
            },
        });

        // 2. Extraer y des-duplicar ancestrías
        const ancestryMap = {};
        models.forEach((m) => {
            m.broadAncestryCategories.forEach((b) => {
                const symbol = b.broadAncestryCategory?.symbol;
                const label = b.broadAncestryCategory?.label;
                if (symbol && label) ancestryMap[symbol] = label;
            });
        });

        const suggestions = Object.entries(ancestryMap).map(([symbol, label]) => ({
            symbol,
            label,
        }));

        return res.json(suggestions);
    } catch (error) {
        console.error("❌ Error en suggestAncestries:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



async function insertPrioritizedModels(req, res) {
    try {
        const { models, prsAnalysisId } = req.body;

        console.log("📦 Body recibido en insert-prioritized:", { models, prsAnalysisId }); // 👈 AÑADE ESTO

        if (!Array.isArray(models) || models.length === 0 || !prsAnalysisId) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        // También puedes loguear cada modelo para depurar
        for (const [index, m] of models.entries()) {
            console.log(`🔍 Modelo[${index}]`, m); // 👈 AÑADE ESTO TAMBIÉN

            await prisma.prioritizedModel.upsert({
                where: {
                    prsModelId_prsAnalysisId: {
                        prsModelId: m.modelId,
                        prsAnalysisId,
                    },
                },
                update: {
                    position: m.position,
                    prsResultId: m.prsResultId || null,
                },
                create: {
                    prsModelId: m.modelId,
                    prsAnalysisId,
                    prsResultId: m.prsResultId || null,
                    position: m.position,
                },
            });
        }

        res.status(201).json({ success: true, inserted: models.length });
    } catch (error) {
        console.error("❌ Error al insertar PrioritizedModel:", error);
        res.status(500).json({ error: "Error interno al insertar modelos priorizados" });
    }
}


/* ─────────────────────────────────────────────
   EXPORTAR HANDLERS
───────────────────────────────────────────── */
module.exports = {
    prioritizePRSModels,
    suggestAncestries,
    insertPrioritizedModels,
};