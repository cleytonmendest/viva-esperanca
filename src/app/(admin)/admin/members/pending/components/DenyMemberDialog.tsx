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
import { toast } from "sonner"
import { denyMember } from "@/app/(admin)/admin/actions"
import { X } from "lucide-react"
import { Tables } from "@/lib/supabase/database.types"

type Member = Tables<'members'>

interface DenyMemberDialogProps {
  member: Member
}

const DenyMemberDialog = ({ member }: DenyMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeny = async () => {
    setIsLoading(true)
    const result = await denyMember(member.id)

    if (result.success) {
      toast.success(result.message)
      setOpen(false)
    } else {
      toast.error(result.message)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-500/20 text-red-600 hover:bg-red-500/10 cursor-pointer">
          <X className="h-4 w-4 mr-1" />
          Negar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Negar Membro</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja negar o cadastro de {member.name}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium mb-2">
              ⚠️ Atenção!
            </p>
            <p className="text-sm text-red-600">
              O cadastro de {member.name} será negado e marcado como inativo.
              O usuário não terá mais acesso ao sistema. Os dados serão mantidos para auditoria.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 space-y-1">
            <p className="text-sm"><span className="text-gray-400">Nome:</span> <span className="font-medium">{member.name}</span></p>
            <p className="text-sm"><span className="text-gray-400">Telefone:</span> <span className="font-medium">{member.phone}</span></p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeny}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Negando..." : "Confirmar Negação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DenyMemberDialog
