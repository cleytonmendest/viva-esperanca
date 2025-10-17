/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/forms/GenericForm.tsx
'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/MultiSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormConfig } from '@/components/forms/form-config';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { applyPhoneMask } from '@/lib/format';
import { forwardRef, useImperativeHandle } from 'react';
import { Combobox } from '@/components/Combobox';

type GenericFormProps = {
    formConfig: FormConfig;
    onSubmit: (data: any) => void;
    isLoading: boolean;
    defaultValues?: any;
    showSubmitButton?: boolean;
};

export type GenericFormRef = {
    submit: () => void;
};

export const GenericForm = forwardRef<GenericFormRef, GenericFormProps>(({ formConfig, onSubmit, isLoading, defaultValues, showSubmitButton = true }, ref) => {
    const methods = useForm({ defaultValues });
    const { handleSubmit, control } = methods;

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        },
    }));

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {formConfig.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                        <Label htmlFor={field.name}>{field.label}{field.required && ' *'}</Label>
                        <Controller
                            name={field.name}
                            control={control}
                            rules={{ required: field.required }}
                            render={({ field: controllerField }) => {
                                switch (field.type) {
                                    case 'multiselect':
                                        return (
                                            <MultiSelect
                                                options={field.options || []}
                                                selected={controllerField.value || []}
                                                onChange={controllerField.onChange}
                                                placeholder={field.placeholder}
                                            />
                                        );
                                    case 'select':
                                        return (
                                            <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.placeholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        );
                                    case 'radio':
                                        return (
                                            <RadioGroup
                                                onValueChange={controllerField.onChange}
                                                defaultValue={controllerField.value}
                                                className={`flex ${field.options && field?.options?.length > 2 ? 'flex-col' : 'flex-row'}`}>
                                                {field.options?.map(option => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option.value}  id={option.value}  />
                                                        <Label htmlFor={option.value} >{option.label}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        );
                                    case 'textarea':
                                        return (
                                            <Textarea placeholder={field.placeholder} {...controllerField} />
                                        )
                                    case 'tel':
                                        return (
                                            <Input
                                                {...controllerField}
                                                type='text'
                                                placeholder={field.placeholder}
                                                maxLength={15}
                                                onChange={(e) => {
                                                    const maskedValue = applyPhoneMask(e.target.value);
                                                    controllerField.onChange(maskedValue);
                                                }}
                                            />
                                        )
                                    case 'combobox':
                                        return (
                                            <Combobox
                                                options={field.options || []}
                                                value={controllerField.value || ''}
                                                onChange={controllerField.onChange}
                                                placeholder={field.placeholder || ''}
                                                empty={field.empty || 'Nenhum resultado.'}
                                            />
                                        );
                                    default:
                                        return (
                                            <Input
                                                name={controllerField.name}
                                                value={controllerField.value}
                                                onBlur={controllerField.onBlur}
                                                ref={controllerField.ref}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                onChange={(e) => controllerField.onChange(e.target.value)}
                                            />
                                        );
                                }
                            }}
                        />
                    </div>
                ))}
                {showSubmitButton && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
});

GenericForm.displayName = 'GenericForm';