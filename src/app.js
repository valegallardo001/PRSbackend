// app.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();


const broadAncestryRoutes = require('./routes/broadAncestryRoutes');
const traitCategoryRoutes = require('./routes/traitCategoryRoutes');
const traitRoutes = require('./routes/traitRoutes');
const ancestryTraitCategoryRoutes = require('./routes/ancestryTraitCategoryRoutes');
const prioritizationRoutes = require("./routes/prioritizationRoutes");
const traitCategoryGroupedRouter = require('./routes/traitCategoryGroupedRouter');


// Configuración de CORS según el entorno
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',               // Desarrollo local
      process.env.FRONTEND_URL               // Producción (definida en .env)
    ];

    // Permitir sin origen (como Postman) o si el origen está permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
};


app.use(cors(corsOptions));
app.use(express.json());



// API routes
app.use('/api/ancestries', broadAncestryRoutes);
app.use('/api/trait-categories', traitCategoryRoutes);
app.use('/api/traits', traitRoutes);
app.use('/api/trait-categories/by-ancestry', ancestryTraitCategoryRoutes);
app.use("/api", traitRoutes); 
app.use("/api/prioritization", prioritizationRoutes);
app.use('/api', traitCategoryGroupedRouter);

module.exports = app;
