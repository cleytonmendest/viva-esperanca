'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Assignment } from "./EventAssignmentTable";
import { updateAssignmentMember } from "../../../actions";

interface MemberAssignmentProps {
    assignment: Assignment
}

const MemberAssignment = ({ assignment }: MemberAssignmentProps) => {
    const { profile } = useAuthStore();

    const handleAssignMember = async () => {''
        if (!profile) return;

        const result = await updateAssignmentMember(assignment.id, profile.id, assignment.event_id);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' })
        } else {
            toast.error(result.message, { position: 'top-center' })
        }
    };

    if(!assignment.tasks?.sector) return null

    const isButtonDisabled = !profile?.sector?.includes(assignment.tasks?.sector) || !!assignment.members

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={isButtonDisabled} variant={!isButtonDisabled ? 'default' : 'outline'} size="sm">Assumir</Button>
            </DialogTrigger>
            <DialogContent className="!max-w-xs">
                <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <DialogDescription>
                        Essa ação vinculará você a esta vaga de voluntariado. Para desvincular será necessário contatar seu lider de ministério.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="w-full flex justify-between pt-5">
                        <DialogClose asChild>
                            <Button variant='destructive'>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button variant="default" onClick={() => handleAssignMember()}>
                            Assumir
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default MemberAssignment