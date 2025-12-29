'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { submitVisitorForm } from '@/app/(site)/actions';
import { applyPhoneMask } from '@/lib/format';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

type VisitorFormData = {
  visitor_name: string;
  visitor_whatsapp: string;
  visitor_city: string;
  visite_date: string;
  first_time: boolean;
  event_name: string;
  invited_by: string;
  how_found_church: string;
  prayer_requests: string;
  consent_lgpd: boolean;
};

const TOTAL_STEPS = 3;

export default function VisitorFormClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<VisitorFormData>({
    defaultValues: {
      visite_date: new Date().toISOString().split('T')[0],
      first_time: true,
      consent_lgpd: false,
    }
  });

  const phoneValue = watch('visitor_whatsapp');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setValue('visitor_whatsapp', masked);
  };

  // Validar campos do passo atual antes de avançar
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof VisitorFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['visitor_name', 'visitor_whatsapp', 'visite_date'];
        break;
      case 2:
        fieldsToValidate = ['first_time']; // outros campos são opcionais
        break;
      case 3:
        fieldsToValidate = ['consent_lgpd'];
        break;
    }

    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: VisitorFormData) => {
    setIsLoading(true);

    try {
      const result = await submitVisitorForm({
        visitor_name: data.visitor_name,
        visitor_whatsapp: data.visitor_whatsapp,
        visitor_city: data.visitor_city || null,
        visite_date: data.visite_date,
        first_time: data.first_time,
        event_name: data.event_name || null,
        invited_by: data.invited_by || null,
        how_found_church: data.how_found_church || null,
        prayer_requests: data.prayer_requests || null,
        consent_lgpd: data.consent_lgpd,
      });

      if (result.success) {
        router.push('/visitante/obrigado');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Ocorreu um erro ao enviar o formulário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Barra de Progresso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Passo {currentStep} de {TOTAL_STEPS}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* PASSO 1: Dados Básicos */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Dados Básicos
            </h2>

            {/* Nome */}
            <div>
              <Label htmlFor="visitor_name" className="text-base font-semibold">
                Nome completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="visitor_name"
                type="text"
                placeholder="Seu nome completo"
                className="mt-2"
                {...register('visitor_name', { required: 'Nome é obrigatório' })}
              />
              {errors.visitor_name && (
                <p className="text-red-500 text-sm mt-1">{errors.visitor_name.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="visitor_whatsapp" className="text-base font-semibold">
                WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="visitor_whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                className="mt-2"
                value={phoneValue || ''}
                {...register('visitor_whatsapp', {
                  required: 'WhatsApp é obrigatório',
                  minLength: { value: 15, message: 'Número incompleto' }
                })}
                onChange={handlePhoneChange}
              />
              {errors.visitor_whatsapp && (
                <p className="text-red-500 text-sm mt-1">{errors.visitor_whatsapp.message}</p>
              )}
            </div>

            {/* Data da visita */}
            <div>
              <Label htmlFor="visite_date" className="text-base font-semibold">
                Data da visita <span className="text-red-500">*</span>
              </Label>
              <Input
                id="visite_date"
                type="date"
                className="mt-2"
                {...register('visite_date', { required: 'Data é obrigatória' })}
              />
              {errors.visite_date && (
                <p className="text-red-500 text-sm mt-1">{errors.visite_date.message}</p>
              )}
            </div>
          </div>
        )}

        {/* PASSO 2: Sobre sua Visita */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Sobre sua Visita
            </h2>

            {/* Primeira vez */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                É sua primeira vez na igreja? <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                defaultValue="true"
                onValueChange={(value) => setValue('first_time', value === 'true')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="first-yes" />
                  <Label htmlFor="first-yes" className="font-normal cursor-pointer">
                    Sim, é minha primeira vez
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="first-no" />
                  <Label htmlFor="first-no" className="font-normal cursor-pointer">
                    Não, já vim antes
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Nome do evento */}
            <div>
              <Label htmlFor="event_name" className="text-base font-semibold">
                Nome do culto/evento
              </Label>
              <Input
                id="event_name"
                type="text"
                placeholder="Ex: Culto de Domingo, Culto de Jovens..."
                className="mt-2"
                {...register('event_name')}
              />
              <p className="text-neutral-500 text-sm mt-1">
                Qual culto ou evento você participou?
              </p>
            </div>

            {/* Convidado por */}
            <div>
              <Label htmlFor="invited_by" className="text-base font-semibold">
                Foi convidado por alguém?
              </Label>
              <Input
                id="invited_by"
                type="text"
                placeholder="Nome da pessoa que te convidou"
                className="mt-2"
                {...register('invited_by')}
              />
            </div>

            {/* Como conheceu */}
            <div>
              <Label htmlFor="how_found_church" className="text-base font-semibold">
                Como conheceu a igreja?
              </Label>
              <Input
                id="how_found_church"
                type="text"
                placeholder="Ex: Instagram, Google, indicação de amigo..."
                className="mt-2"
                {...register('how_found_church')}
              />
            </div>
          </div>
        )}

        {/* PASSO 3: Mais Informações */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Mais Informações
            </h2>

            {/* Cidade/Bairro */}
            <div>
              <Label htmlFor="visitor_city" className="text-base font-semibold">
                Cidade ou Bairro
              </Label>
              <Input
                id="visitor_city"
                type="text"
                placeholder="Onde você mora?"
                className="mt-2"
                {...register('visitor_city')}
              />
            </div>

            {/* Pedidos de oração */}
            <div>
              <Label htmlFor="prayer_requests" className="text-base font-semibold">
                Pedidos de oração (opcional)
              </Label>
              <Textarea
                id="prayer_requests"
                placeholder="Compartilhe suas necessidades de oração. Ficaremos honrados em orar por você."
                className="mt-2 min-h-[100px]"
                {...register('prayer_requests')}
              />
              <p className="text-neutral-500 text-sm mt-1">
                Seu pedido será tratado com confidencialidade.
              </p>
            </div>

            {/* Consentimento LGPD */}
            <div className="border-t pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent_lgpd"
                  {...register('consent_lgpd', {
                    required: 'Você precisa concordar com os termos para continuar'
                  })}
                  onCheckedChange={(checked) => setValue('consent_lgpd', checked as boolean)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="consent_lgpd"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    Concordo que a Igreja Viva Esperança utilize meus dados pessoais (nome, telefone, cidade e pedidos de oração) para entrar em contato comigo e enviar informações sobre eventos e atividades da igreja. Estou ciente de que posso solicitar a exclusão dos meus dados a qualquer momento através do contato da igreja. <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>
              {errors.consent_lgpd && (
                <p className="text-red-500 text-sm mt-2">{errors.consent_lgpd.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex gap-4 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar cadastro'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
