import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vehiclesRouter from "./routes/vehicles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openapi = YAML.load(join(__dirname, "../openapi.yaml"));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "voltflow-ev" });
});

app.use("/vehicles", vehiclesRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.listen(PORT, () => {
  console.log(`EV API http://localhost:${PORT}`);
  console.log(`Swagger  http://localhost:${PORT}/api-docs`);
});
