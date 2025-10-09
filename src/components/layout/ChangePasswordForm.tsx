"use client"

import { useState } from "react"
import { createClient } from "@/libs/supabase/client"
import { Database } from "@/libs/supabase/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SupabaseClient } from "@supabase/supabase-js"

export const ChangePasswordForm = () => {
    const supabase: SupabaseClient<Database> = createClient()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.")
            return
        }

        if (newPassword.length < 6) {
            toast.error("A nova senha deve ter no mínimo 6 caracteres.")
            return
        }

        setIsSubmitting(true)

        const { data: isValid, error: rpcError } = await supabase.rpc("verify_user_password", { password: currentPassword })

        if (rpcError || !isValid) {
            toast.error("A senha atual está incorreta.")
            setIsSubmitting(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

        if (updateError) {
            toast.error("Erro ao alterar a senha. Tente novamente.")
            console.error("Password change error:", updateError)
        } else {
            toast.success("Senha alterada com sucesso!")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        }

        setIsSubmitting(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Alterando..." : "Alterar senha"}
            </Button>
        </form>
    )
}
