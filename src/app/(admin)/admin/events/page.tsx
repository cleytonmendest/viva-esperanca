import { createClient } from "@/libs/supabase/server"
import EventTable from "./components/EventTable"

const EventsPage = async () => {
  const supabase = await createClient()
  const { data: events } = await supabase.from("events").select("*")

  return (
    <>
      <section className="lg:max-w-4xl my-4 mx-auto w-full">
        <h1 className="text-3xl font-bold">Eventos</h1>
      </section>
      <section className="lg:max-w-4xl my-4 mx-auto w-full">
        <EventTable initialEvents={events || []} />
      </section>
    </>
  )
}

export default EventsPage