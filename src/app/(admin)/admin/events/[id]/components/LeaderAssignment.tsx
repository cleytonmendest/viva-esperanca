'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Assignment } from "./EventAssignmentTable"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/Combobox";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { updateAssignmentMember } from "../../../lib/actions";

interface LeaderAssignmentProps {
  assignment: Assignment;
  allMembers: { id: string; name: string }[];
}

const LeaderAssignment = ({ assignment, allMembers }: LeaderAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialMember] = useState(assignment.member_id || ""); 
  const [selectedMember, setSelectedMember] = useState(initialMember);

  const alreadyTaken = !!assignment.member_id;

  const isChanged = useMemo(() => initialMember !== selectedMember, [initialMember, selectedMember]);

  const memberOptions = allMembers.map(member => ({
    value: member.id,
    label: member.name
  }));

  const handleAssignMember = async () => {
    if (!isChanged) return;

    setIsSubmitting(true);

    const result = await updateAssignmentMember(assignment.id, selectedMember || null, assignment.event_id);

    if (result.success) {
        toast.success(result.message, { position: 'top-center' });
        setIsOpen(false);
    } else {
        toast.error(result.message, { position: 'top-center' });
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{alreadyTaken ? 'Alterar' : 'Preencher'}</Button>
      </DialogTrigger>
      <DialogContent className="!max-w-sm">
        <DialogHeader>
          <DialogTitle>{alreadyTaken ? 'Alterar Membro' : 'Preencher Membro'}</DialogTitle>
          <DialogDescription>
            Altere ou preencha o membro que será responsável pela tarefa.
          </DialogDescription>
        </DialogHeader>
        
        <Combobox
            options={memberOptions}
            value={selectedMember}
            onChange={setSelectedMember}
            placeholder="Selecione um membro..."
            empty="Nenhum membro encontrado."
        />

        <DialogFooter>
          <div className="w-full flex justify-between pt-5">
            <DialogClose asChild>
              <Button variant='destructive' type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
                variant="default" 
                onClick={handleAssignMember} 
                disabled={isSubmitting || !isChanged}
            >
              {isSubmitting ? 'Salvando...' : (alreadyTaken ? 'Alterar Membro' : 'Preencher Membro')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaderAssignment;