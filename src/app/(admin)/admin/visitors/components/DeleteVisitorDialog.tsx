
'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteVisitor } from "../../actions";

interface DeleteVisitorDialogProps {
    visitorId: string;
    visitorName: string;
}

const DeleteVisitorDialog = ({ visitorId, visitorName }: DeleteVisitorDialogProps) => {
    const { profile } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (profile?.role !== 'admin') {
        return null;
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteVisitor(visitorId);

        if (result.success) {
            toast.success(`Visitante "${visitorName}" removido com sucesso!`, { position: 'top-center' });
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
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
                    <DialogTitle>Remover Visitante?</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja remover o visitante **{visitorName}**? Esta ação não pode ser desfeita.
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

export default DeleteVisitorDialog;
