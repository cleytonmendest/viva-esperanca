import EventAssignmentTable from "@/components/layout/EventAssignmentTable";
import { createClient } from "@/libs/supabase/server";

const EventDetailPage = async ({ params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const eventId = params.id;

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    const { data: assignments } = await supabase
        .from('event_assignments')
        .select(`
            *,
            tasks ( * ),
            members ( * )
    `)
        .eq('event_id', eventId);

    const { data: allMembers } = await supabase.from('members').select('id, name');

    console.log('Event ID:', eventId)

    if (!event) {
        return <div>Evento não encontrado.</div>;
    }

    return (
        <>
            <section>
                <h1>{event.name}</h1>
                <p>{event.description}</p>
                <p>Data do Evento: {event.event_date}</p>
                <div className="lg:max-w-4xl mx-auto w-full">
                    <EventAssignmentTable allMembers={allMembers || []} assignments={assignments || []} eventId={eventId} />
                </div>
            </section>
        </>
    )
}

export default EventDetailPage