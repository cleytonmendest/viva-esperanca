'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PendingApproval = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="p-4 h-[calc(100dvh-4rem)] flex flex-col justify-center items-center">
      <section className="text-center w-fit max-w-md border border-gray-300 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-4">Aguardando Aprovação</h1>
        <p className="text-gray-300 mb-6">
          Sua conta está pendente de aprovação. Por favor, contate ou aguarde o administrador/líder aprovar sua conta.
        </p>
        <Button
          onClick={handleLogout}
          variant="outline"
          disabled={isLoading}
          className="w-full cursor-pointer"
        >
          {isLoading ? 'Saindo...' : 'Sair'}
        </Button>
      </section>
    </div>
  )
}

export default PendingApproval