// src/app/admin/signup/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '../../../libs/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        birthdate: '',
        phone:'',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: formData.fullName,
                },
            },
        });

        if (error) {
            setMessage('Erro no cadastro: ' + error.message);
        } else {
            setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação e aguarde a aprovação de um administrador.');
            // Opcional: desabilitar o formulário após o sucesso
        }
    };

    return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-4'>
            <Card className='w-full md:max-w-sm lg:max-w-xl'>
                <CardHeader>
                    <CardTitle>Inscreva-se</CardTitle>
                    <CardDescription>Crie sua conta abaixo</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp}>
                        <div className='mb-4'>
                            <Label className='mb-2' htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="João da Silva"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label className='mb-2' htmlFor="phone">Telefone (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(99) 99999-9999"
                                    required
                                />
                            </div>
                            <div>
                                <Label className='mb-2' htmlFor="birthdate">Data de nascimento</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2' htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className='mb-4'>
                            <Label className='mb-2' htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="********"
                                required
                            />
                        </div>

                        <Button type="submit" style={{ width: '100%', padding: '10px' }}>
                            Cadastrar
                        </Button>
                        {message && <p style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}