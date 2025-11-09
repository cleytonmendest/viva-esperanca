'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { applyPhoneMask, unmaskPhoneNumber } from '@/lib/format';
import { UserPlus } from 'lucide-react';

type VisitorFormData = {
  visitor_name: string;
  visitor_whatsapp: string;
  first_time: boolean;
  visitor_status: 'sem_igreja' | 'congregando' | 'membro';
  event_name?: string;
};

type VisitorFormProps = {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  triggerSize?: 'default' | 'sm' | 'lg';
};

export function VisitorForm({
  triggerText = 'Quero Participar',
  triggerVariant = 'default',
  triggerSize = 'default',
}: VisitorFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VisitorFormData>({
    defaultValues: {
      first_time: true,
      visitor_status: 'sem_igreja',
    },
  });

  const phoneValue = watch('visitor_whatsapp');
  const firstTime = watch('first_time');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setValue('visitor_whatsapp', masked);
  };

  const onSubmit = async (data: VisitorFormData) => {
    setIsLoading(true);

    try {
      const unmaskedPhone = unmaskPhoneNumber(data.visitor_whatsapp);

      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          visitor_whatsapp: unmaskedPhone,
          visite_date: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        reset();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar informações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          <UserPlus className="mr-2 h-5 w-5" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Queremos Conhecer Você!</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para que possamos te receber melhor em nossa igreja.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="visitor_name">Nome Completo *</Label>
            <Input
              id="visitor_name"
              {...register('visitor_name', { required: 'Nome é obrigatório' })}
              placeholder="Seu nome"
              disabled={isLoading}
            />
            {errors.visitor_name && (
              <p className="text-sm text-destructive">{errors.visitor_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitor_whatsapp">WhatsApp *</Label>
            <Input
              id="visitor_whatsapp"
              {...register('visitor_whatsapp', {
                required: 'WhatsApp é obrigatório',
                minLength: {
                  value: 14,
                  message: 'WhatsApp inválido',
                },
              })}
              placeholder="(21) 99999-9999"
              value={phoneValue || ''}
              onChange={handlePhoneChange}
              disabled={isLoading}
            />
            {errors.visitor_whatsapp && (
              <p className="text-sm text-destructive">{errors.visitor_whatsapp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>É sua primeira visita? *</Label>
            <RadioGroup
              defaultValue="true"
              onValueChange={(value) => setValue('first_time', value === 'true')}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="first-time-yes" />
                <Label htmlFor="first-time-yes" className="font-normal cursor-pointer">
                  Sim, é minha primeira vez
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="first-time-no" />
                <Label htmlFor="first-time-no" className="font-normal cursor-pointer">
                  Não, já visitei antes
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitor_status">Qual sua situação? *</Label>
            <Select
              onValueChange={(value) =>
                setValue('visitor_status', value as 'sem_igreja' | 'congregando' | 'membro')
              }
              defaultValue="sem_igreja"
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_igreja">Não tenho igreja</SelectItem>
                <SelectItem value="congregando">Estou voltando a congregar</SelectItem>
                <SelectItem value="membro">Sou membro de outra igreja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_name">Como conheceu a igreja? (opcional)</Label>
            <Input
              id="event_name"
              {...register('event_name')}
              placeholder="Ex: Amigo me convidou, Redes sociais, Passando pela rua..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
