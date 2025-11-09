import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

interface ExecutiveSummaryCardProps {
  stats: {
    totalMembers: number;
    pendingApproval: number;
    availableTasks: number;
    visitorsNeedingFollowup: number;
  };
}

export function ExecutiveSummaryCard({ stats }: ExecutiveSummaryCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Visão Geral da Igreja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats.totalMembers}</p>
            <p className="text-sm text-muted-foreground">Membros ativos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</p>
            <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.availableTasks}</p>
            <p className="text-sm text-muted-foreground">Tarefas disponíveis</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{stats.visitorsNeedingFollowup}</p>
            <p className="text-sm text-muted-foreground">Visitantes s/ follow-up</p>
          </div>
        </div>

        <Link href="/admin/dashboard" className="block">
          <Button className="w-full" variant="default">
            Ver Dashboard Completo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
