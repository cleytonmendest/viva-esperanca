import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, BookOpen, Target, Eye, Heart, Users, Church, Cross } from 'lucide-react';

export const metadata = {
  title: 'Quem Somos | Igreja Viva Esperança',
  description: 'Conheça a história, missão, visão e valores da Igreja Viva Esperança. Uma comunidade bíblica, acolhedora e generosa.',
};

export default function QuemSomosPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-card to-background py-20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4">
            <Church className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Quem Somos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça nossa história, nossos valores e o que nos move como igreja
            </p>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossa História</h2>
            <Separator className="w-20 mx-auto" />
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              A <strong>Igreja Viva Esperança</strong> foi oficialmente fundada em 08 de junho de 2021, mas cremos que seu propósito foi gerado por Deus antes mesmo da fundação do mundo. Não nascemos apenas como uma instituição religiosa; somos parte da continuidade da obra que Jesus iniciou na cruz, por meio de Sua morte e ressurreição.
            </p>

            <p>
              O nome Viva Esperança nasceu da convicção bíblica expressa em 1 Pedro 1.3, onde a Escritura declara que Deus, em Sua grande misericórdia, nos deu uma nova vida para vivermos uma viva esperança. Esse versículo tornou-se para nós um fundamento profético e identitário. Assim, entendemos que Deus não apenas nos chamou para plantar uma igreja, mas para proclamar uma esperança viva, ativa e poderosa, que transforma vidas pela graça de Cristo.
            </p>

            <p>
              Nossa jornada começou quando recebemos de Deus a direção para sair da amada AD Vargem Pequena, filial da AD Zona Sul na Gávea, e plantar do zero aquilo que Ele já havia semeado em nossos corações: a Igreja Viva Esperança. O desejo que nos movia era participar do que Deus estava fazendo neste tempo, gerando esperança, vida e salvação para aqueles que se encontravam perdidos e distantes do Seu amor.
            </p>
            <p>
              Nascemos com uma missão clara: glorificar a Cristo através da proclamação do Evangelho e da formação de discípulos de Jesus. Nossa visão é gerar discípulos que se pareçam com Cristo, e nosso propósito é amar todos aqueles por quem Jesus entregou Sua vida.
            </p>
            <h2 className="text-2xl font-bold mb-4">Os Primeiros Passos</h2>
            <p>
              Começamos nos reunindo em um auditório comercial no centro da Taquara, na Estrada do Tindiba, 2089 – sala 308, todas as terças-feiras. Nosso início foi marcado por milagres: Deus nos deu uma direção, mas não tínhamos recursos. Ainda assim, experimentamos Sua provisão de maneira extraordinária, vivendo a verdade de que, quando Deus dá a visão, Ele também envia a provisão.
            </p>
            <p>
              Após quase dez meses reunindo-nos apenas às terças-feiras, avançamos para as reuniões aos domingos. Iniciamos a igreja com 13 pessoas, e Deus, em Sua graça, continuou a acrescentar crescimento.
            </p>
            <h2 className="text-2xl font-bold mb-4">Um Marco de Fé</h2>
            <p>
              Ao completarmos três anos, o Senhor nos presenteou com a compra de um imóvel no centro da Taquara, onde hoje nos reunimos. Uma nova temporada de milagres se estabeleceu sobre nós, e temos vivido como aqueles que sonham. Ainda há muito a ser feito, mas reconhecemos o quanto já avançamos desde o início — e sabemos que Deus ainda não nos levou ao nosso lugar definitivo.
            </p>
            <p>
              Estamos caminhando com fé, confiando que Aquele que começou a boa obra é fiel para completá-la. O desejo do nosso coração é ser uma igreja composta por milhares de discípulos de Jesus, transformando a sociedade e manifestando o Reino de Deus na Terra.
            </p>
            <p>
              E você também pode fazer parte dessa história.
              Seja bem-vindo à Igreja Viva Esperança — onde Cristo nos deu uma nova vida para vivermos uma viva esperança.
            </p>

            <Card className="bg-primary/5 border-primary/20 mt-8">
              <CardContent className="pt-6">
                <p className="text-center italic text-foreground">
                  &quot;Porque somos cooperadores de Deus; lavoura de Deus, edifício de Deus sois vós.&quot;
                  <br />
                  <span className="text-sm font-semibold text-primary">1 Coríntios 3:9</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Missão */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Missão</h3>
                <Separator className="w-12 mx-auto" />
                <p className="text-muted-foreground">
                  Fazer discípulos de Cristo, proclamando o evangelho, edificando vidas e servindo
                  com amor à nossa comunidade.
                </p>
              </CardContent>
            </Card>

            {/* Visão */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Visão</h3>
                <Separator className="w-12 mx-auto" />
                <p className="text-muted-foreground">
                  Ser uma igreja relevante, que impacta vidas através do evangelho, formando uma
                  comunidade madura em Cristo e multiplicadora de discípulos.
                </p>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Valores</h3>
                <Separator className="w-12 mx-auto" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Palavra de Deus como autoridade</p>
                  <p>✓ Amor e acolhimento</p>
                  <p>✓ Generosidade e serviço</p>
                  <p>✓ Comunhão autêntica</p>
                  <p>✓ Excelência com humildade</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossa Crença (Declaração de Fé) */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossa Crença</h2>
            <p className="text-muted-foreground">
              Fundamentados na Palavra de Deus, cremos em:
            </p>
          </div>

          <div className="space-y-4">
            {/* Bíblia */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">A Bíblia Sagrada</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos que a Bíblia é a Palavra de Deus inspirada, inerrante e infalível, nossa única
                regra de fé e prática. (2 Timóteo 3:16-17)
              </CollapsibleContent>
            </Collapsible>

            {/* Trindade */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Cross className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">A Trindade</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos em um único Deus eternamente existente em três pessoas: Pai, Filho e Espírito Santo,
                coiguais e coeternos. (Mateus 28:19)
              </CollapsibleContent>
            </Collapsible>

            {/* Jesus Cristo */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Jesus Cristo</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos em Jesus Cristo, o Filho de Deus, plenamente Deus e plenamente homem, nascido da
                virgem Maria, que morreu na cruz pelos nossos pecados, ressuscitou ao terceiro dia e está
                assentado à direita do Pai. (Filipenses 2:6-11)
              </CollapsibleContent>
            </Collapsible>

            {/* Salvação */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Salvação pela Graça</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos que a salvação é pela graça mediante a fé em Jesus Cristo, não por obras, para que
                ninguém se glorie. (Efésios 2:8-9)
              </CollapsibleContent>
            </Collapsible>

            {/* Espírito Santo */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Church className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">O Espírito Santo</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos no Espírito Santo que regenera, habita, capacita e santifica os crentes,
                distribuindo dons espirituais para edificação do corpo de Cristo. (João 14:16-17, 1 Coríntios 12)
              </CollapsibleContent>
            </Collapsible>

            {/* Igreja */}
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">A Igreja</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                Cremos na igreja como o corpo de Cristo, formada por todos os crentes, chamada para adorar,
                edificar uns aos outros e proclamar o evangelho. (Efésios 1:22-23)
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </section>

      {/* Liderança */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossa Liderança</h2>
            <p className="text-muted-foreground">
              Servos comprometidos em pastorear o rebanho de Deus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pastor Principal */}
            <Card className="text-center">
              <CardContent className="pt-8 space-y-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/50" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Esmair Filho</h3>
                  <p className="text-sm text-primary">Liderança Pastoral</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Dedicado ao ensino da Palavra e cuidado do rebanho
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pastora */}
            <Card className="text-center">
              <CardContent className="pt-8 space-y-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center">
                  <Heart className="h-16 w-16 text-primary/50" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kelly Coelho</h3>
                  <p className="text-sm text-primary">Ministério Pastoral</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cuidado com as famílias e ministério de acolhimento
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Líderes */}
            <Card className="text-center">
              <CardContent className="pt-8 space-y-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/50" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Equipe de Líderes</h3>
                  <p className="text-sm text-primary">Liderança Compartilhada</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Servindo nos diversos ministérios da igreja
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Venha Fazer Parte da Nossa Família</h2>
          <p className="text-lg text-muted-foreground">
            Se você está procurando uma igreja onde possa crescer espiritualmente, construir
            relacionamentos significativos e servir ao Senhor, você é bem-vindo aqui!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contato"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 font-medium transition-colors"
            >
              Entre em Contato
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 font-medium transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
