import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Assignment } from "./EventAssignmentTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaderAssignmentProps {
  assignment: Assignment;
  allMembers: { id: string; name: string }[];
}

const LeaderAssignment = ({ assignment, allMembers }: LeaderAssignmentProps) => {
  const memberOwner = allMembers.find(member => member.id === assignment.member_id)
  const alreadyTaken = !!assignment.member_id

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">{alreadyTaken ? 'Alterar' : 'Preencher'}</Button>
      </DialogTrigger>
      <DialogContent className="!max-w-xs">
        <DialogHeader>
          <DialogTitle>{alreadyTaken ? 'Alterar Membro' : 'Preencher Membro'}</DialogTitle>
          <DialogDescription>
            Altere ou preencha o membro que será responsável pela tarefa.
          </DialogDescription>
        </DialogHeader>
        <Select defaultValue={memberOwner?.id}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar Membro" />
          </SelectTrigger>
          <SelectContent>
            {allMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <div className="w-full flex justify-between pt-5">
            <DialogClose asChild>
              <Button variant='destructive'>
                Cancelar
              </Button>
            </DialogClose>
            <Button variant="default">
              {alreadyTaken ? 'Alterar Membro' : 'Preencher Membro'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaderAssignment