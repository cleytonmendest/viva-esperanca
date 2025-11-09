"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "30d";

  const handlePeriodChange = (value: string) => {
    router.push(`/admin/dashboard?period=${value}`);
  };

  return (
    <Select value={currentPeriod} onValueChange={handlePeriodChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Últimos 7 dias</SelectItem>
        <SelectItem value="30d">Últimos 30 dias</SelectItem>
        <SelectItem value="3m">Últimos 3 meses</SelectItem>
        <SelectItem value="6m">Últimos 6 meses</SelectItem>
        <SelectItem value="1y">Último ano</SelectItem>
      </SelectContent>
    </Select>
  );
}
