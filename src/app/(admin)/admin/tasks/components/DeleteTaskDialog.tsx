'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/libs/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteTaskDialogProps {
    taskId: string;
    taskName: string;
}

const DeleteTaskDialog = ({ taskId, taskName }: DeleteTaskDialogProps) => {
    const { profile } = useAuthStore();
    const router = useRouter();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Se o usuário não for admin, o componente não renderiza nada.
    if (profile?.role !== 'admin') {
        return null;
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            toast.error('Tivemos um problema ao remover a tarefa. Tente novamente.', { position: 'top-center' });
        } else {
            toast.success(`Tarefa "${taskName}" removida com sucesso!`, { position: 'top-center' });
            router.refresh();
            setIsOpen(false);
        }
        setIsDeleting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-xs">
                <DialogHeader>
                    <DialogTitle>Remover Tarefa?</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja remover a tarefa **{taskName}**? Todas as escalas associadas a ela nos eventos também serão removidas. Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="w-full flex justify-between pt-5">
                        <DialogClose asChild>
                            <Button variant='outline' type="button" disabled={isDeleting}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Removendo...' : 'Sim, remover'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteTaskDialog;