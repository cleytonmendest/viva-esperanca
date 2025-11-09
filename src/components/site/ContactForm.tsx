'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { applyPhoneMask, unmaskPhoneNumber } from '@/lib/format';
import { sendContactMessage } from '@/app/(site)/actions';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>();

  const phoneValue = watch('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setValue('phone', masked);
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);

    try {
      const unmaskedPhone = unmaskPhoneNumber(data.phone);
      const result = await sendContactMessage({
        ...data,
        phone: unmaskedPhone,
      });

      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Seu nome"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'E-mail é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido',
            },
          })}
          placeholder="seu@email.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
        <Input
          id="phone"
          {...register('phone', {
            required: 'Telefone é obrigatório',
            minLength: {
              value: 14,
              message: 'Telefone inválido',
            },
          })}
          placeholder="(21) 99999-9999"
          value={phoneValue || ''}
          onChange={handlePhoneChange}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea
          id="message"
          {...register('message', { required: 'Mensagem é obrigatória' })}
          placeholder="Como podemos ajudar?"
          rows={6}
          disabled={isLoading}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
      </Button>
    </form>
  );
}
