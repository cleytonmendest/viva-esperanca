import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Baby, HandHeart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ministries = [
  {
    id: 'louvor',
    name: 'Louvor',
    icon: Music,
    description: 'Ministério de música e adoração que conduz a igreja na presença de Deus através do louvor.',
    details: 'Equipe de músicos, cantores e técnicos dedicados a exaltar o nome do Senhor.',
    color: 'from-blue-500/10 to-blue-500/5',
  },
  {
    id: 'midia',
    name: 'Mídia',
    icon: (props: any) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"/>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
      </svg>
    ),
    description: 'Responsável por som, imagem, transmissão online e tecnologia durante os cultos e eventos.',
    details: 'Operação de câmeras, streaming, projeção e sonorização.',
    color: 'from-purple-500/10 to-purple-500/5',
  },
  {
    id: 'infantil',
    name: 'Infantil',
    icon: Baby,
    description: 'Ministério dedicado ao ensino e cuidado das crianças, formando a próxima geração de cristãos.',
    details: 'Atividades lúdicas, ensino bíblico adaptado e muito amor para os pequenos.',
    color: 'from-pink-500/10 to-pink-500/5',
  },
  // {
  //   id: 'social',
  //   name: 'Ação Social',
  //   icon: HandHeart,
  //   description: 'Servindo à comunidade com amor prático através de ações sociais e projetos de impacto.',
  //   details: 'Distribuição de alimentos, roupas, visitas e apoio às famílias necessitadas.',
  //   color: 'from-green-500/10 to-green-500/5',
  // },
  {
    id: 'geral',
    name: 'Ministério Geral',
    icon: Users,
    description: 'Diversos ministérios de apoio que mantêm a igreja funcionando com excelência.',
    details: 'Recepção, segurança, limpeza, logística e outras áreas de suporte.',
    color: 'from-orange-500/10 to-orange-500/5',
  },
];

export function MinistriesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Ministérios</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubra como você pode usar seus dons para servir ao Senhor e à igreja
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ministries.map((ministry) => {
            const Icon = ministry.icon;
            return (
              <Card key={ministry.id} className="border-2 hover:border-primary transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ministry.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{ministry.name}</CardTitle>
                  <CardDescription>{ministry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{ministry.details}</p>
                </CardContent>
              </Card>
            );
          })}

          {/* Card CTA "Quero Servir" */}
          <Card className="border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Quero Servir</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use seus dons e talentos para a glória de Deus
              </p>
              <Button asChild>
                <Link href="/contato">Entre em Contato</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              &quot;Cada um exerça o dom que recebeu para servir aos outros, administrando fielmente a graça de Deus em suas múltiplas formas.&quot;
            </p>
            <p className="text-sm text-primary font-semibold">1 Pedro 4:10</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
