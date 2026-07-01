-- CreateTable
CREATE TABLE "HelenaConversation" (
    "id" TEXT NOT NULL,
    "sourceSessionId" TEXT NOT NULL,
    "chatSlug" TEXT,
    "userLabel" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastTurnAt" TIMESTAMP(3) NOT NULL,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelenaConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelenaTurn" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sourceSessionId" TEXT NOT NULL,
    "sourceUserMessageId" TEXT,
    "sourceAssistantMessageId" TEXT NOT NULL,
    "sourceCreatedAt" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "domain" TEXT,
    "routingReason" TEXT,
    "confidence" DOUBLE PRECISION,
    "metricsRequested" JSONB,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "groupBy" JSONB,
    "toolUsed" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "cachedTokens" INTEGER,
    "costUsd" DECIMAL(65,30),
    "latencyMs" INTEGER,
    "status" TEXT,
    "errorCode" TEXT,
    "verifierOk" BOOLEAN,
    "feedbackRating" TEXT,
    "feedbackReason" TEXT,
    "studioPlan" JSONB,
    "studioDomain" TEXT,
    "studioMetricKey" TEXT,
    "studioConfidence" DOUBLE PRECISION,
    "hasDivergence" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HelenaTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelenaSyncRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "trigger" TEXT NOT NULL DEFAULT 'schedule',
    "turnsImported" INTEGER NOT NULL DEFAULT 0,
    "watermark" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "HelenaSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelenaConversation_sourceSessionId_key" ON "HelenaConversation"("sourceSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "HelenaTurn_sourceAssistantMessageId_key" ON "HelenaTurn"("sourceAssistantMessageId");

-- CreateIndex
CREATE INDEX "HelenaTurn_domain_idx" ON "HelenaTurn"("domain");

-- CreateIndex
CREATE INDEX "HelenaTurn_sourceCreatedAt_idx" ON "HelenaTurn"("sourceCreatedAt");

-- CreateIndex
CREATE INDEX "HelenaTurn_feedbackRating_idx" ON "HelenaTurn"("feedbackRating");

-- CreateIndex
CREATE INDEX "HelenaTurn_hasDivergence_idx" ON "HelenaTurn"("hasDivergence");

-- CreateIndex
CREATE INDEX "HelenaSyncRun_status_idx" ON "HelenaSyncRun"("status");

-- CreateIndex
CREATE INDEX "HelenaSyncRun_startedAt_idx" ON "HelenaSyncRun"("startedAt");

-- AddForeignKey
ALTER TABLE "HelenaTurn" ADD CONSTRAINT "HelenaTurn_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "HelenaConversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
