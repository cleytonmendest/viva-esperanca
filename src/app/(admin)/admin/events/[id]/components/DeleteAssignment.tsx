'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface DeleteAssignmentProps {
    assignmentName: string;
    onClick: () => void;
    isDeleting: boolean;
}

const DeleteAssignment = ({assignmentName, onClick, isDeleting}: DeleteAssignmentProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-xs">
                <DialogHeader>
                    <DialogTitle>Remover Tarefa?</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja remover a tarefa &quot;{assignmentName}&quot; deste evento? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="w-full flex justify-between pt-5">
                        <DialogClose asChild>
                            <Button variant='outline' type="button">Cancelar</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button
                                variant="destructive"
                                onClick={() => onClick()}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Removendo...' : 'Remover'}
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteAssignment