const app = require('./app');
const swaggerUi = require("swagger-ui-express"); // <-- esta línea es importante
const swaggerSpec = require("./swaggerConfig");

const PORT = process.env.PORT || 3001;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});