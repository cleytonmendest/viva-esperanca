import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Heart, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EventsSection } from '@/components/site/EventsSection';
import { MinistriesSection } from '@/components/site/MinistriesSection';
import { TestimonialsSection } from '@/components/site/TestimonialsSection';
import { VisitorForm } from '@/components/site/VisitorForm';

export default function Home() {
  return (
    <main className="">
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden lg:h-[700px] min-h-[600px] mt-16 flex items-center justify-center">
        <video
          src="https://jtgfdbzqpsyckqcgsrhd.supabase.co/storage/v1/object/public/Viva%20Esperanca/Ive-Video(1).mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            Bem-vindo à<br />Igreja Viva Esperança
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Uma igreja bíblica, acolhedora e generosa
          </p>

          {/* Horários dos Cultos */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Horários dos Cultos</h3>
            </div>
            <div className="space-y-2 text-sm md:text-base">
              <p>🗓️ Domingo: 10h e 18h</p>
              <p>🗓️ Quarta-feira: 19h30</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <VisitorForm
              triggerText="Quero Participar"
              triggerVariant="default"
              triggerSize="lg"
            />
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
              <Link href="/quem-somos">
                <BookOpen className="mr-2 h-5 w-5" />
                Conheça Nossa História
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
              <Link href="/programacao">
                <Calendar className="mr-2 h-5 w-5" />
                Veja a Programação
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Valores</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Somos uma comunidade fundamentada nos princípios bíblicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bíblica */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Bíblica</h3>
                <p className="text-muted-foreground">
                  Fundamentados na Palavra de Deus, cremos que a Bíblia é nossa autoridade máxima para fé e prática.
                </p>
              </CardContent>
            </Card>

            {/* Acolhedora */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Acolhedora</h3>
                <p className="text-muted-foreground">
                  Um lugar onde todos são bem-vindos, tratados com amor e respeito, independente de sua história.
                </p>
              </CardContent>
            </Card>

            {/* Generosa */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Generosa</h3>
                <p className="text-muted-foreground">
                  Comprometidos em servir e abençoar nossa comunidade através de ações práticas de amor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Próximos Eventos Section */}
      <EventsSection />

      {/* Ministérios Section */}
      <MinistriesSection />

      {/* Depoimentos Section */}
      <TestimonialsSection />

      {/* Endereço e Mapa Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Venha Nos Visitar</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-96">
            {/* Informações */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Nosso Endereço</h3>
                  <p className="text-muted-foreground">
                    Avenida Nelson Cardoso, 299<br />
                    Taquara, Rio de Janeiro - RJ<br />
                    CEP: 22730-900
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Horários dos Cultos</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Domingo: 10h e 18h</p>
                    <p>Quarta-feira: 19h30</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/contato">
                  Entre em Contato
                </Link>
              </Button>
            </div>

            {/* Mapa */}
            <div className="rounded-lg overflow-hidden h-96 lg:h-full">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12329.494732491006!2d-43.37237395735968!3d-22.9178069116136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bd966a38f8a59%3A0xdfecedf02605ce6f!2sIVE%20-%20Igreja%20Viva%20Esperan%C3%A7a!5e1!3m2!1spt-BR!2sbr!4v1755646414777!5m2!1spt-BR!2sbr"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Igreja Viva Esperança"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Seja Parte da Família Viva Esperança
          </h2>
          <p className="text-lg text-muted-foreground">
            Estamos ansiosos para conhecê-lo! Venha experimentar uma comunidade que vive o amor de Cristo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <VisitorForm
              triggerText="Quero Conhecer a Igreja"
              triggerSize="lg"
            />
            <Button asChild size="lg" variant="outline">
              <Link href="/ofertas">
                <Heart className="mr-2 h-5 w-5" />
                Contribuir
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
