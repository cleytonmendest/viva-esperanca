import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Home, Heart, Music, Baby, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Programação e GC\'s | Igreja Viva Esperança',
  description: 'Conheça nossa programação de cultos e Grupos de Comunhão (GC\'s). Participe da nossa comunidade!',
};

export default function ProgramacaoPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-card to-background py-20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4">
            <Calendar className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Programação</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Confira nossa programação de cultos e atividades. Junte-se a nós!
            </p>
          </div>
        </div>
      </section>

      {/* Horários dos Cultos */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Horários dos Cultos</h2>
            <p className="text-muted-foreground">
              Encontros semanais para adoração, ensino e comunhão
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domingo Manhã */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Culto de Domingo - Manhã</CardTitle>
                    <CardDescription>10h00</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Culto de celebração com louvor, pregação da Palavra e ministério infantil.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Presencial e Online</span>
                </div>
              </CardContent>
            </Card>

            {/* Domingo Noite */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Culto de Domingo - Noite</CardTitle>
                    <CardDescription>18h00</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Culto de adoração com ênfase em louvor e ensino prático da Palavra.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Presencial e Online</span>
                </div>
              </CardContent>
            </Card>

            {/* Quarta-feira */}
            <Card className="border-2 hover:border-primary transition-colors md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Culto de Quarta-feira</CardTitle>
                    <CardDescription>19h30</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Culto de oração e ensino bíblico. Um momento especial de busca a Deus e edificação espiritual.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Presencial</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endereço */}
          <Card className="mt-8 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Localização</h3>
                  <p className="text-muted-foreground">
                    Avenida Nelson Cardoso, 299<br />
                    Taquara, Rio de Janeiro - RJ<br />
                    CEP: 22730-900
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grupos de Comunhão (GC's) */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Grupos de Comunhão (GC's)</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pequenos grupos que se reúnem durante a semana para comunhão, estudo bíblico e
              edificação mútua. Um lugar para criar vínculos profundos e crescer na fé.
            </p>
          </div>

          {/* O que é um GC */}
          <Card className="mb-12">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">O que é um Grupo de Comunhão?</CardTitle>
                  <CardDescription>Comunidade em ação</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Os Grupos de Comunhão (GC's) são o coração da nossa igreja local. São pequenos grupos
                de pessoas que se reúnem regularmente em casas para:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Estudar a Bíblia</strong> de forma prática e aplicada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Orar uns pelos outros</strong> compartilhando necessidades e vitórias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Construir relacionamentos</strong> genuínos e duradouros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Servir à comunidade</strong> com amor prático</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Crescer espiritualmente</strong> em um ambiente acolhedor</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tipos de GC's */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Nossos GC's</h3>
            <p className="text-muted-foreground">
              Temos grupos para diferentes fases e necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GC Geral */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">GC Geral</h4>
                <p className="text-sm text-muted-foreground">
                  Para toda a família. Grupos mistos com estudos variados.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Diversos horários
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Em casas de membros
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GC Jovens */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">GC Jovens</h4>
                <p className="text-sm text-muted-foreground">
                  Para jovens e adolescentes. Foco em temas relevantes para essa fase.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Sextas às 19h
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Local rotativo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GC Casais */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">GC Casais</h4>
                <p className="text-sm text-muted-foreground">
                  Exclusivo para casais. Fortalecendo matrimônios à luz da Palavra.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Quinzenalmente
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Em casas de casais
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GC Mulheres */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">GC Mulheres</h4>
                <p className="text-sm text-muted-foreground">
                  Para mulheres de todas as idades. Comunhão e edificação feminina.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Quintas às 19h
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Na igreja
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GC Homens */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">GC Homens</h4>
                <p className="text-sm text-muted-foreground">
                  Para homens. Desafios da masculinidade cristã.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Sábados às 8h
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Na igreja
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GC Infantil */}
            <Card className="text-center border-2">
              <CardContent className="pt-8 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Baby className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-lg">Ministério Infantil</h4>
                <p className="text-sm text-muted-foreground">
                  Para crianças durante os cultos. Ensino lúdico e apropriado.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Domingos 10h e 18h
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Home className="h-3 w-3" />
                    Na igreja
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outros Ministérios */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Outros Ministérios</h2>
            <p className="text-muted-foreground">
              Oportunidades para servir e usar seus dons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Louvor */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-3">
                <Music className="h-12 w-12 mx-auto text-primary" />
                <h4 className="font-semibold">Louvor</h4>
                <p className="text-xs text-muted-foreground">
                  Equipe de músicos e cantores
                </p>
              </CardContent>
            </Card>

            {/* Mídia */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 mx-auto text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                </div>
                <h4 className="font-semibold">Mídia</h4>
                <p className="text-xs text-muted-foreground">
                  Som, imagem e transmissão
                </p>
              </CardContent>
            </Card>

            {/* Social */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-3">
                <HandHeart className="h-12 w-12 mx-auto text-primary" />
                <h4 className="font-semibold">Ação Social</h4>
                <p className="text-xs text-muted-foreground">
                  Servindo a comunidade
                </p>
              </CardContent>
            </Card>

            {/* Infantil */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-3">
                <Baby className="h-12 w-12 mx-auto text-primary" />
                <h4 className="font-semibold">Infantil</h4>
                <p className="text-xs text-muted-foreground">
                  Cuidado e ensino às crianças
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Pronto para Participar?</h2>
          <p className="text-lg text-muted-foreground">
            Junte-se a nós em nossos cultos e GC's. Queremos conhecer você e caminhar juntos na fé!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contato">
                Quero Participar
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
