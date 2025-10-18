'use client'

import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"

const formConfig: FormConfig = [
  { name: 'email', label: 'E-mail', type: 'email', placeholder: 'm@example.com', required: true },
  { name: 'password', label: 'Senha', type: 'password', required: true }
]

interface LoginProps {
  email: string
  password: string
}

export default function LoginPage() {
  const supabase = createClient()
  const formRef = useRef<GenericFormRef>(null);

  const handleSignIn = async (data:LoginProps) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Erro ao fazer login')
    } else {
      window.location.href = '/admin'
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const submitHandler = async () => {
    formRef.current?.submit();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h2>Login - Painel Admin</h2>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Logue em sua conta</CardTitle>
          <CardDescription>
            Insira seu login abaixo
          </CardDescription>
          <CardAction>
            <Button className='cursor-pointer' variant="link">
              <Link href="/admin/signup">Inscreva-se</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <GenericForm
            ref={formRef}
            formConfig={formConfig}
            isLoading={false}
            onSubmit={handleSignIn}
            showSubmitButton={false}
          />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={submitHandler} className="w-full cursor-pointer">
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleGoogleLogin}
          >
            Login com Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}