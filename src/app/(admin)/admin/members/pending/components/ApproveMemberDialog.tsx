'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { approveMember } from "@/app/(admin)/admin/actions"
import { Check } from "lucide-react"
import { Tables } from "@/lib/supabase/database.types"

type Member = Tables<'members'>
type Role = Tables<'roles'>

interface ApproveMemberDialogProps {
  member: Member
  roles: Role[]
}

const ApproveMemberDialog = ({ member, roles }: ApproveMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    if (!selectedRoleId) {
      toast.error("Por favor, selecione uma role para o membro")
      return
    }

    setIsLoading(true)
    const result = await approveMember(member.id, selectedRoleId)

    if (result.success) {
      toast.success(result.message)
      setOpen(false)
      setSelectedRoleId("")
    } else {
      toast.error(result.message)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 cursor-pointer">
          <Check className="h-4 w-4 mr-1" />
          Aprovar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar Membro</DialogTitle>
          <DialogDescription>
            Aprove {member.name} e defina sua role no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role do Membro</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione uma role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Escolha a role que melhor descreve a função do membro na igreja
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-600">
              ℹ️ O membro será notificado e terá acesso ao sistema com as permissões da role selecionada
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isLoading || !selectedRoleId}
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
          >
            {isLoading ? "Aprovando..." : "Aprovar Membro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ApproveMemberDialog
