"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createRole } from "../actions";
import { toast } from "sonner";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoleDialog({ open, onOpenChange }: AddRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_leadership: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createRole(formData);

    if (result.success) {
      toast.success(result.message);
      setFormData({ name: "", description: "", is_leadership: false });
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
          <DialogTitle>Nova Role</DialogTitle>
          <DialogDescription>
            Crie uma nova role para o sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Líder de Louvor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da role"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_leadership" className="text-base">
                Role de Liderança
              </Label>
              <p className="text-sm text-muted-foreground">
                Esta role terá acesso a recursos administrativos
              </p>
            </div>
            <Switch
              id="is_leadership"
              checked={formData.is_leadership}
              onCheckedChange={(checked) => setFormData({ ...formData, is_leadership: checked })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
