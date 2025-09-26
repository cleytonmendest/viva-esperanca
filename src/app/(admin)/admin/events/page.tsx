import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AddNewEventDialog from "./components/AddEventDialog"
import { createClient } from "@/libs/supabase/server"
import { formatDate } from "@/utils/format"
import EditNewEventDialog from "./components/EditEventDialog"

const EventsPage = async () => {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*')

  return (
    <>
      <section className="lg:max-w-4xl my-4 mx-auto w-full">
        <h1 className="text-3xl font-bold">Eventos</h1>
      </section>
      <section className="lg:max-w-4xl my-4 mx-auto w-full">
        <div className="flex justify-end mb-4">
          <AddNewEventDialog />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Editar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events && events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  {formatDate(event.event_date)}
                </TableCell>
                <TableCell>
                  <EditNewEventDialog
                    event={event}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  )
}

export default EventsPage