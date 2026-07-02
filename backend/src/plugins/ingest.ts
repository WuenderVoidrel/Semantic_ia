import type { FastifyInstance } from "fastify";

import { env } from "../env.js";
import { createHelenaSource } from "../shared/sources/create-helena-source.js";
import { IngestRepository } from "../modules/ingest/ingest.repository.js";
import { IngestService } from "../modules/ingest/ingest.service.js";
import { EnrichService } from "../modules/telemetry/enrich.service.js";
import { TelemetryRepository } from "../modules/telemetry/telemetry.repository.js";
import { SemanticRepository } from "../modules/semantic/semantic.repository.js";
import { SemanticService } from "../modules/semantic/semantic.service.js";

export async function registerIngest(app: FastifyInstance) {
  const source = createHelenaSource();
  const repository = new IngestRepository(app.prisma);
  const service = new IngestService(repository, source, { filter: { chatSlugs: env.HELENA_BI_CHAT_SLUGS } });
  const enrichService = new EnrichService(
    new TelemetryRepository(app.prisma),
    new SemanticService(new SemanticRepository(app.prisma))
  );

  app.decorate("ingestService", service as never);

  let running = false;
  const tick = async () => {
    if (running) {
      app.log.warn("ingest: ciclo anterior ainda em execucao; pulando");
      return;
    }
    running = true;
    try {
      const result = await service.runSync("schedule");
      app.log.info({ result }, "ingest: ciclo concluido");
      const enriched = await enrichService.enrichPending();
      if (enriched.processed > 0) {
        app.log.info({ enriched }, "ingest: enriquecimento concluido");
      }
    } catch (error) {
      app.log.error({ error }, "ingest: falha inesperada no ciclo");
    } finally {
      running = false;
    }
  };

  let interval: NodeJS.Timeout | null = null;
  if (env.HELENA_SYNC_ENABLED) {
    interval = setInterval(tick, env.HELENA_SYNC_INTERVAL_MS);
    app.log.info({ intervalMs: env.HELENA_SYNC_INTERVAL_MS }, "ingest: scheduler ativo");
  }

  app.addHook("onClose", async () => {
    if (interval) {
      clearInterval(interval);
    }
    await source.close();
  });
}
