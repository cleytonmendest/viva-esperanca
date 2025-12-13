import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface TopMembersProps {
  members: Array<{
    name: string;
    count: number;
  }>;
  period?: string;
}

const medals = ["🥇", "🥈", "🥉"];

// Função para traduzir o período para português
function getPeriodLabel(period?: string): string {
  switch (period) {
    case '7d':
      return 'Últimos 7 dias';
    case '30d':
      return 'Últimos 30 dias';
    case '3m':
      return 'Últimos 3 meses';
    case '6m':
      return 'Últimos 6 meses';
    case '1y':
      return 'Último ano';
    default:
      return 'Últimos 30 dias';
  }
}

export function TopMembers({ members, period }: TopMembersProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top 5 Membros Mais Ativos
          </CardTitle>
          <p className="text-sm text-muted-foreground">{getPeriodLabel(period)}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top 5 Membros Mais Ativos
        </CardTitle>
        <p className="text-sm text-muted-foreground">{getPeriodLabel(period)}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medals[index] || `${index + 1}.`}</span>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.count} tarefas completadas
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{member.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
