import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Obrigado! | Igreja Viva Esperança',
  description: 'Seu cadastro foi recebido com sucesso!',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-12">
          {/* Ícone de sucesso */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
          </div>

          {/* Mensagem principal */}
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
            Obrigado!
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            Seu cadastro foi recebido com sucesso! Ficamos muito felizes com sua visita.
          </p>

          {/* Informações adicionais */}
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
              O que acontece agora?
            </h2>
            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-500 mr-2 mt-0.5">✓</span>
                <span>Nossa equipe receberá suas informações</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-500 mr-2 mt-0.5">✓</span>
                <span>Entraremos em contato via WhatsApp nos próximos dias</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-500 mr-2 mt-0.5">✓</span>
                <span>Se compartilhou pedidos de oração, estaremos orando por você</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-500 mr-2 mt-0.5">✓</span>
                <span>Você receberá informações sobre nossos próximos eventos</span>
              </li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-5 w-5" />
                Voltar para o início
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
              <Link href="/programacao">
                <Calendar className="h-5 w-5" />
                Ver programação
              </Link>
            </Button>
          </div>

          {/* Mensagem final */}
          <p className="text-neutral-500 dark:text-neutral-400 mt-8 text-sm">
            Que Deus te abençoe! Esperamos vê-lo novamente em breve.
          </p>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 text-neutral-600 dark:text-neutral-400 text-sm">
          <p>
            Alguma dúvida? Entre em contato conosco através do{' '}
            <Link href="/contato" className="text-primary hover:underline font-medium">
              formulário de contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
