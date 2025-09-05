'use client'

import { useState } from 'react'
import { createClient } from '../../../../libs/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const [user, setUser] = useState({ email: '', password: '' })
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    })

    if (error) {
      alert('Erro no login: ' + error.message)
    } else {
      router.refresh()
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
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input id="password" type="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={handleSignIn} className="w-full cursor-pointer">
            Login
          </Button>
          <Button variant="outline" className="w-full cursor-pointer" onClick={handleGoogleLogin}>
            Login com Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}