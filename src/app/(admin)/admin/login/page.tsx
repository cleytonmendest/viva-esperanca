'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"
import { ArrowLeft } from 'lucide-react'

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
  const formRef = useRef<GenericFormRef>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (data: LoginProps) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setIsLoading(false)
      if (error.message.includes('Invalid login credentials')) {
        toast.error('E-mail ou senha incorretos')
      } else {
        toast.error('Erro ao fazer login. Tente novamente.')
      }
    } else {
      toast.success('Login realizado com sucesso!')
      window.location.href = '/admin'
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error('Erro ao fazer login com Google')
      }
    } catch (error) {
      toast.error('Erro ao fazer login com Google')
    }
  }

  const submitHandler = async () => {
    formRef.current?.submit()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-gradient-to-br from-background to-muted/20">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao site
      </Link>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">
          Acesse o painel administrativo da Igreja Viva Esperança
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Fazer login</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GenericForm
            ref={formRef}
            formConfig={formConfig}
            isLoading={isLoading}
            onSubmit={handleSignIn}
            showSubmitButton={false}
          />

          <Button
            onClick={submitHandler}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div> */}

          {/* <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button> */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              href="/admin/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Criar conta
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Voltar para o site
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}