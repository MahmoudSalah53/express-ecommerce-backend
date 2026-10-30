import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { openApiSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes";
import cookieParser from "cookie-parser";

const SWAGGER_UI_CDN = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.1";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:"],
      },
    },
  }),
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp({ logger }));
app.use(cookieParser());

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: "E-commerce API",
    // Vercel does not serve swagger-ui-dist from node_modules, so the UI assets load from a CDN.
    customCssUrl: `${SWAGGER_UI_CDN}/swagger-ui.css`,
    customJs: [`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`, `${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js`],
    swaggerOptions: { validatorUrl: null, withCredentials: true },
  }),
);
app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
