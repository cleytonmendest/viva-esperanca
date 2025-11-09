import { ContactForm } from '@/components/site/ContactForm';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Contato | Igreja Viva Esperança',
  description: 'Entre em contato conosco. Estamos prontos para ouvir você e responder suas dúvidas.',
};

export default function ContatoPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-card to-background py-20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Entre em Contato</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para ouvir você. Seja para conhecer mais sobre nossa igreja, tirar dúvidas
              ou compartilhar uma necessidade, ficaremos felizes em ajudar.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Envie uma Mensagem</h2>
                <p className="text-muted-foreground">
                  Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                </p>
              </div>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Informações de Contato</h2>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Endereço</h3>
                      <p className="text-muted-foreground">
                        Avenida Nelson Cardoso, 299<br />
                        Taquara, Rio de Janeiro - RJ<br />
                        CEP: 22730-900
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telefone / WhatsApp</h3>
                      <a
                        href="tel:+5521999999999"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        (21) 99999-9999
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">E-mail</h3>
                      <a
                        href="mailto:contato@vivaesperanca.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        contato@vivaesperanca.com
                      </a>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Horários dos Cultos</h3>
                      <div className="text-muted-foreground">
                        <p>Domingo: 10h e 18h</p>
                        <p>Quarta-feira: 19h30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Redes Sociais</h3>
                <div className="flex gap-4">
                  <Link
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6 text-primary" />
                  </Link>
                  <Link
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6 text-primary" />
                  </Link>
                  <Link
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-6 w-6 text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full py-16 bg-card">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Como Chegar</h2>
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3673.4582789876543!2d-43.36825!3d-22.91667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU1JzAwLjAiUyA0M8KwMjInMDUuNyJX!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da Igreja Viva Esperança"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
