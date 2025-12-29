import VisitorFormClient from './VisitorFormClient';

export const metadata = {
  title: 'Cadastro de Visitante | Igreja Viva Esperança',
  description: 'Bem-vindo à Igreja Viva Esperança! Preencha o formulário para que possamos conhecê-lo melhor.',
};

export default function VisitorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
            Bem-vindo!
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Ficamos felizes com sua visita! Preencha o formulário abaixo para que possamos conhecê-lo melhor e manter contato.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-8">
          <VisitorFormClient />
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Seus dados serão tratados com total privacidade e utilizados apenas para contato da igreja.
        </p>
      </div>
    </div>
  );
}
