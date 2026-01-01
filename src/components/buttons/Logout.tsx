'use client'

import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import React from "react"
import { createClient } from "@/lib/supabase/client"

const ButtonLogout = () => {
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
        <Button className="w-fit" onClick={handleLogout} variant='destructive'>
            {isLoading ? 'Saindo...' : 'Sair'}
        </Button>
    )
}

export default ButtonLogout