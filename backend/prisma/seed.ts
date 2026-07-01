import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.semanticTest.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.domain.deleteMany();

  const domains = await Promise.all([
    prisma.domain.create({
      data: {
        name: "Agricola",
        slug: "agricola",
        description: "Indicadores gerais das operacoes agricolas."
      }
    }),
    prisma.domain.create({
      data: {
        name: "Plantio/Preparo",
        slug: "plantio-preparo",
        description: "Indicadores ligados ao preparo e ao plantio."
      }
    }),
    prisma.domain.create({
      data: {
        name: "Automotiva",
        slug: "automotiva",
        description: "Indicadores operacionais de frota e equipamentos."
      }
    }),
    prisma.domain.create({
      data: {
        name: "Materia-Prima",
        slug: "materia-prima",
        description: "Indicadores de recebimento e processamento de materia-prima."
      }
    })
  ]);

  const domainBySlug = new Map(domains.map((domain) => [domain.slug, domain.id]));

  await prisma.metric.createMany({
    data: [
      {
        domainId: domainBySlug.get("agricola")!,
        name: "Moagem",
        technicalKey: "agricola.moagem",
        daxMeasure: "[Moagem]",
        unit: "t",
        description: "Volume total de cana moida.",
        synonyms: ["moagem", "moeu", "cana moida", "moagem do dia", "moagem agricola"],
        status: "active"
      },
      {
        domainId: domainBySlug.get("automotiva")!,
        name: "Disponibilidade de Equipamentos",
        technicalKey: "automotiva.disponibilidade_equipamentos",
        daxMeasure: "[Disponibilidade Equipamentos]",
        unit: "%",
        description: "Disponibilidade operacional da frota e dos equipamentos.",
        synonyms: ["disponibilidade", "disp", "disponibilidade da frota", "equipamentos disponiveis"],
        status: "active"
      },
      {
        domainId: domainBySlug.get("plantio-preparo")!,
        name: "Hectares Plantados",
        technicalKey: "plantio.hectares_plantio_diario",
        daxMeasure: "[Hectares Plantio Diario]",
        unit: "ha",
        description: "Area plantada no periodo consultado.",
        synonyms: ["hectares plantados", "plantio", "area plantada"],
        status: "active"
      },
      {
        domainId: domainBySlug.get("agricola")!,
        name: "Entrada de Cana",
        technicalKey: "agricola.entrada_cana",
        daxMeasure: "[Toneladas Frentes]",
        unit: "t",
        description: "Toneladas de cana entregues pelas frentes.",
        synonyms: ["entrada de cana", "entrega", "toneladas", "cana entregue"],
        status: "active"
      }
    ]
  });

  await prisma.skill.createMany({
    data: [
      { name: "metric-resolver", type: "semantic", description: "Resolve a metrica principal da pergunta." },
      { name: "ranges-relativos", type: "temporal", description: "Interpreta periodos relativos como ontem e semana." },
      { name: "turnos-rules", type: "grouping", description: "Aplica regras de agrupamento por turno." },
      { name: "data-freshness", type: "validation", description: "Avalia indicios de atualizacao e defasagem." },
      { name: "chart-recommendation", type: "presentation", description: "Sugere visualizacoes para a resposta." },
      { name: "answer-verifier", type: "validation", description: "Confere coerencia basica do plano antes da resposta." }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
