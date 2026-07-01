"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TelemetryStats } from "@/types";

const GREEN = "#16a34a";
const SLATE = "#64748b";
const FEEDBACK_COLORS = { like: "#16a34a", dislike: "#dc2626", none: "#cbd5e1" };

export function TelemetryCharts({ stats }: { stats: TelemetryStats }) {
  const feedbackData = [
    { name: "Likes", key: "like", value: stats.feedback.like },
    { name: "Dislikes", key: "dislike", value: stats.feedback.dislike },
    { name: "Sem feedback", key: "none", value: stats.feedback.none }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="bg-white/80 xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Volume de perguntas por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.volumeByDay} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: SLATE }} />
              <YAxis tick={{ fontSize: 12, fill: SLATE }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="turns" name="Turnos" stroke={GREEN} fill={GREEN} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="text-base">Turnos por dominio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.byDomain} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="domain" tick={{ fontSize: 12, fill: SLATE }} />
              <YAxis tick={{ fontSize: 12, fill: SLATE }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="turns" name="Turnos" fill={GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="text-base">Feedback dos usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={feedbackData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {feedbackData.map((entry) => (
                  <Cell key={entry.key} fill={FEEDBACK_COLORS[entry.key as keyof typeof FEEDBACK_COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
