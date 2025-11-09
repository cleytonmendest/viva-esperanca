import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

const FooterMain = () => {
  return (
    <footer className="w-full bg-card border-t mt-auto">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About */}
          <div className="space-y-4">
            <Image
              src="/images/logo-ive-branco.png"
              alt="Logo Viva Esperança"
              width={160}
              height={60}
            />
            <p className="text-sm text-muted-foreground">
              Uma igreja bíblica, acolhedora e generosa, transformando vidas através do amor de Cristo.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/quem-somos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  href="/programacao"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Programação (GC's)
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/ofertas"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Dízimos e Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Avenida Nelson Cardoso, 299<br />Taquara, Rio de Janeiro - RJ<br />22730-900</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+5521999999999" className="hover:text-primary transition-colors">
                  (21) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:contato@vivaesperanca.com" className="hover:text-primary transition-colors">
                  contato@vivaesperanca.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Domingo: 10h e 18h</p>
                  <p>Quarta: 19h30</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Igreja Viva Esperança. Todos os direitos reservados.</p>
            <p className="text-xs">
              Desenvolvido com <span className="text-red-500">❤</span> para a glória de Deus
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterMain
