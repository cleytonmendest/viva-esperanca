"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TasksBySectorProps {
  data: Record<string, { total: number; filled: number }>;
}

const sectorLabels: Record<string, string> = {
  "mídia": "Mídia",
  "geral": "Geral",
  "louvor": "Louvor",
  "infantil": "Infantil",
  "social": "Social",
};

export function TasksBySector({ data }: TasksBySectorProps) {
  const chartData = Object.entries(data).map(([sector, stats]) => ({
    name: sectorLabels[sector] || sector,
    preenchidas: stats.filled,
    pendentes: stats.total - stats.filled,
    total: stats.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas por Setor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de tarefas preenchidas e pendentes
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="preenchidas" fill="#10b981" name="Preenchidas" stackId="a" />
            <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
