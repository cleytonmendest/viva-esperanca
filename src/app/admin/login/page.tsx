// src/app/admin/login/page.tsx
'use client' // ESSENCIAL: Esta é uma página interativa

import { useState } from 'react'
import { createClient } from '../../../libs/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert('Erro no login: ' + error.message)
    } else {
      router.refresh() // Recarrega a página para que o middleware reconheça a nova sessão
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
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login - Painel Admin</h2>
      <form onSubmit={handleSignIn}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Entrar com Email e Senha
        </button>
      </form>
      <hr style={{ margin: '20px 0' }} />
      <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '10px' }}>
        Entrar com Google
      </button>
    </div>
  )
}