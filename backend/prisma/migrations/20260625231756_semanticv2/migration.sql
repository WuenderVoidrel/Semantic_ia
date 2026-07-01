-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "technicalKey" TEXT NOT NULL,
    "daxMeasure" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "synonyms" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemanticTest" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "normalizedInput" TEXT,
    "generatedPlan" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "needsClarification" BOOLEAN NOT NULL DEFAULT false,
    "resolvedDomainId" TEXT,
    "resolvedMetricId" TEXT,
    "periodValue" TEXT,
    "groupBy" JSONB,
    "relayResult" JSONB,
    "helenaDomainSlug" TEXT,
    "helenaMetricKey" TEXT,
    "hasDivergence" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SemanticTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemanticTokenMiss" (
    "id" TEXT NOT NULL,
    "semanticTestId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "normalizedToken" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SemanticTokenMiss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSuggestion" (
    "id" TEXT NOT NULL,
    "semanticTestId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metricId" TEXT,
    "domainId" TEXT,
    "suggestedAlias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldenCase" (
    "id" TEXT NOT NULL,
    "semanticTestId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedDomainSlug" TEXT,
    "expectedMetricKey" TEXT,
    "expectedPeriodValue" TEXT,
    "expectedGroupBy" JSONB NOT NULL,
    "expectedNeedsClarification" BOOLEAN,
    "tags" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoldenCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Metric_technicalKey_key" ON "Metric"("technicalKey");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "SemanticTokenMiss_normalizedToken_idx" ON "SemanticTokenMiss"("normalizedToken");

-- CreateIndex
CREATE INDEX "CatalogSuggestion_status_idx" ON "CatalogSuggestion"("status");

-- CreateIndex
CREATE INDEX "CatalogSuggestion_normalizedAlias_idx" ON "CatalogSuggestion"("normalizedAlias");

-- CreateIndex
CREATE UNIQUE INDEX "GoldenCase_semanticTestId_key" ON "GoldenCase"("semanticTestId");

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemanticTokenMiss" ADD CONSTRAINT "SemanticTokenMiss_semanticTestId_fkey" FOREIGN KEY ("semanticTestId") REFERENCES "SemanticTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogSuggestion" ADD CONSTRAINT "CatalogSuggestion_semanticTestId_fkey" FOREIGN KEY ("semanticTestId") REFERENCES "SemanticTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogSuggestion" ADD CONSTRAINT "CatalogSuggestion_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoldenCase" ADD CONSTRAINT "GoldenCase_semanticTestId_fkey" FOREIGN KEY ("semanticTestId") REFERENCES "SemanticTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
