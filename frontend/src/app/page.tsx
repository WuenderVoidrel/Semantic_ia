import Link from "next/link";
import { ArrowRight, Database, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Mapa semantico inicial",
    description: "Dominios, metricas e skills organizados como base tecnica da Helena.",
    icon: Database
  },
  {
    title: "Simulador sem LLM",
    description: "Teste perguntas reais e gere semantic plans estruturados com regras deterministicas.",
    icon: Workflow
  },
  {
    title: "Pronto para evoluir",
    description: "Arquitetura preparada para integrar workflows, IA Helena e catalogos reais depois.",
    icon: Sparkles
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(21,128,61,0.18),_transparent_26%),linear-gradient(160deg,_#fbf7ef_0%,_#eef7f5_45%,_#f9fafb_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-soft backdrop-blur md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.4fr_0.9fr] md:items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Projeto fullstack com Fastify + Next.js
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground md:text-6xl">
                  Helena Semantic Studio
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Aplicacao para administrar e validar a primeira camada semantica da IA Helena, com painel tecnico,
                  simulador de perguntas e historico de testes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Entrar no dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/semantic">Testar semantic plan</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-[#f3f0e5] p-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Primeira entrega</p>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold">Backend modular</p>
                    <p className="mt-1 text-sm text-muted-foreground">Fastify, Prisma, Zod e API REST organizada por modulos.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold">Frontend administrativo</p>
                    <p className="mt-1 text-sm text-muted-foreground">Next.js App Router com dashboard, tabelas e simulador.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold">Integracao futura facilitada</p>
                    <p className="mt-1 text-sm text-muted-foreground">Contrato de semantic plan pronto para conversar com a Helena depois.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
