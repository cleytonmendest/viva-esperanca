import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Maria Silva',
    role: 'Membro desde 2020',
    content:
      'A Igreja Viva Esperança mudou minha vida! Encontrei uma família acolhedora que me ajudou a crescer na fé e a entender o amor de Deus de uma forma prática e real.',
    image: null,
  },
  {
    id: 2,
    name: 'João Santos',
    role: 'Líder de GC',
    content:
      'Participar dos Grupos de Comunhão foi transformador. Aqui encontrei amigos verdadeiros e um lugar onde posso ser autêntico, compartilhar minhas lutas e crescer espiritualmente.',
    image: null,
  },
  {
    id: 3,
    name: 'Ana Costa',
    role: 'Membro desde 2019',
    content:
      'O ensino bíblico sólido e a comunhão genuína fazem toda a diferença. Me sinto amada e cuidada, e aprendi a servir ao próximo com alegria e propósito.',
    image: null,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-card to-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Vidas Transformadas</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ouça o que nossos membros têm a dizer sobre sua experiência na Igreja Viva Esperança
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-2 hover:shadow-lg transition-all">
              <CardContent className="pt-8 pb-8 space-y-4">
                {/* Quote Icon */}
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Quote className="h-6 w-6 text-primary" />
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name and Role */}
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Quote */}
        <Card className="mt-12 bg-primary/5 border-primary/20 max-w-3xl mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              "Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram;
              eis que surgiram coisas novas!"
            </p>
            <p className="text-sm text-primary font-semibold">2 Coríntios 5:17</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
