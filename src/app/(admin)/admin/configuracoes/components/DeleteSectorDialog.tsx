"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/lib/supabase/database.types";
import { deleteSector } from "../actions";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

type Sector = Tables<'sectors'>;

interface DeleteSectorDialogProps {
  sector: Sector;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSectorDialog({ sector, open, onOpenChange }: DeleteSectorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    const result = await deleteSector(sector.id);

    if (result.success) {
      toast.success(result.message);
      onOpenChange(false);
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Deletar Setor
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm">
            Você tem certeza que deseja deletar o setor <strong>{sector.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            Este setor não poderá ser deletado se estiver em uso por algum membro.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deletando..." : "Deletar Setor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
