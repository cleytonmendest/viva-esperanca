"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ConversionFunnelProps {
  data: {
    sem_igreja: number;
    congregando: number;
    membro: number;
    desistiu: number;
  };
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const chartData = [
    { name: "Sem Igreja", value: data.sem_igreja, color: "#ef4444" },
    { name: "Congregando", value: data.congregando, color: "#f59e0b" },
    { name: "Membro", value: data.membro, color: "#10b981" },
    { name: "Desistiu", value: data.desistiu, color: "#6b7280" },
  ];

  const total = data.sem_igreja + data.congregando + data.membro + data.desistiu;
  const conversionRate = total > 0 ? ((data.membro / total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão de Visitantes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Taxa de conversão: <span className="font-bold text-green-600">{conversionRate}%</span>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
