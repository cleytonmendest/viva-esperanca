import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDateTime } from '@/lib/format';

export async function EventsSection() {
  const supabase = await createClient();

  // Buscar próximos 3 eventos
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3);

  if (!events || events.length === 0) {
    return (
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Próximos Eventos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fique por dentro da nossa programação
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Novos eventos serão divulgados em breve. Acompanhe nossas redes sociais!
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/contato">Entre em Contato</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Próximos Eventos</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Participe dos nossos próximos encontros e atividades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description || 'Participe deste evento especial!'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{new Date(event.event_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Igreja Viva Esperança</span>
                </div>

                <Button asChild className="w-full mt-4" size="sm">
                  <Link href="/contato">Quero Participar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length >= 3 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/programacao">Ver Toda Programação</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
