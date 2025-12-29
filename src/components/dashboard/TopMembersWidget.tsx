import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface TopMember {
  name: string;
  count: number;
  user_id: string | null;
}

interface TopMembersWidgetProps {
  members: TopMember[];
  period?: string;
}

// Ícones e cores para top 3
const rankStyles = {
  1: { icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/20" },
  2: { icon: Medal, color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950/20" },
  3: { icon: Award, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/20" },
};

const periodLabels: Record<string, string> = {
  '7d': 'últimos 7 dias',
  '30d': 'últimos 30 dias',
  '90d': 'últimos 90 dias',
  'all': 'todo o período',
};

export function TopMembersWidget({ members, period = '30d' }: TopMembersWidgetProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Membros Mais Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade registrada no período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Membros Mais Ativos
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Ranking de contribuições nos {periodLabels[period]}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((member, index) => {
          const rank = index + 1;
          const style = rankStyles[rank as keyof typeof rankStyles];
          const Icon = style?.icon || Trophy;
          const colorClass = style?.color || "text-muted-foreground";
          const bgColorClass = style?.bgColor || "bg-muted/50";

          return (
            <div
              key={`${member.name}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg ${bgColorClass} transition-colors hover:scale-[1.02]`}
            >
              {/* Ranking Icon */}
              <div className="flex-shrink-0">
                <Icon className={`h-6 w-6 ${colorClass}`} />
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
                  <p className="font-semibold text-sm truncate">
                    {member.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {member.count} {member.count === 1 ? 'ação' : 'ações'} registradas
                </p>
              </div>

              {/* Count Badge */}
              <div className={`flex-shrink-0 px-3 py-1 rounded-full ${bgColorClass} border border-current ${colorClass}`}>
                <span className="text-sm font-bold">{member.count}</span>
              </div>
            </div>
          );
        })}

        {members.length === 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            Mostrando top 5 contribuidores
          </p>
        )}
      </CardContent>
    </Card>
  );
}
