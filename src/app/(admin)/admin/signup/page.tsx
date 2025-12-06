'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"
import { unmaskPhoneNumber } from '@/lib/format'
import { ArrowLeft } from 'lucide-react'

const formConfig: FormConfig = [
  { name: 'name', label: 'Nome completo', type: 'text', placeholder: 'João da Silva', required: true },
  { name: 'phone', label: 'Telefone (WhatsApp)', type: 'tel', placeholder: '(99) 99999-9999', required: true },
  { name: 'birthdate', label: 'Data de nascimento', type: 'date', required: true },
  { name: 'email', label: 'E-mail', type: 'email', placeholder: 'm@example.com', required: true },
  { name: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true }
]

interface SignUpProps {
  name: string
  phone: string
  birthdate: string
  email: string
  password: string
}

export default function SignUpPage() {
  const supabase = createClient()
  const formRef = useRef<GenericFormRef>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (data: SignUpProps) => {
    setIsLoading(true)

    // Validação de senha
    if (data.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          birthdate: data.birthdate,
          phone: unmaskPhoneNumber(data.phone),
        },
      },
    })

    if (error) {
      setIsLoading(false)
      if (error.message.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado')
      } else if (error.message.includes('Password')) {
        toast.error('A senha deve ter no mínimo 6 caracteres')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } else {
      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação de um administrador.')
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error('Erro ao cadastrar com Google')
      }
    } catch (error) {
      toast.error('Erro ao cadastrar com Google')
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
        <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
        <p className="text-muted-foreground">
          Junte-se à comunidade da Igreja Viva Esperança
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GenericForm
            ref={formRef}
            formConfig={formConfig}
            isLoading={isLoading}
            onSubmit={handleSignUp}
            showSubmitButton={false}
          />

          <Button
            onClick={submitHandler}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou cadastre-se com
              </span>
            </div>
          </div> */}

          {/* <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
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

          <div className="text-xs text-center text-muted-foreground px-4">
            Ao criar sua conta, você será adicionado como membro pendente e aguardará aprovação de um administrador.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link
              href="/admin/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Fazer login
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