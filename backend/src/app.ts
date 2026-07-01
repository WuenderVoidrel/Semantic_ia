import Fastify from "fastify";

import { catalogSuggestionRoutes } from "./modules/catalog-suggestions/catalog-suggestion.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { domainRoutes } from "./modules/domains/domain.routes.js";
import { goldenCaseRoutes } from "./modules/golden-cases/golden-case.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { ingestRoutes } from "./modules/ingest/ingest.routes.js";
import { metricRoutes } from "./modules/metrics/metric.routes.js";
import { semanticRoutes } from "./modules/semantic/semantic.routes.js";
import { skillRoutes } from "./modules/skills/skill.routes.js";
import { telemetryRoutes } from "./modules/telemetry/telemetry.routes.js";
import { registerCors } from "./plugins/cors.js";
import { registerIngest } from "./plugins/ingest.js";
import { registerPrisma } from "./plugins/prisma.js";
import { globalErrorHandler } from "./shared/errors/error-handler.js";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await registerCors(app);
  await registerPrisma(app);
  await registerIngest(app);

  app.setErrorHandler(globalErrorHandler);

  await healthRoutes(app);
  await dashboardRoutes(app);
  await domainRoutes(app);
  await metricRoutes(app);
  await skillRoutes(app);
  await semanticRoutes(app);
  await catalogSuggestionRoutes(app);
  await goldenCaseRoutes(app);
  await ingestRoutes(app);
  await telemetryRoutes(app);

  return app;
}
