import EventAssignmentTable from "@/app/(admin)/admin/events/[id]/components/EventAssignmentTable";
import { createClient } from "@/libs/supabase/server";
import { formatDate } from "@/utils/format";

const EventDetailPage = async ({ params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const { id: eventId } = await params

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

    if (!event) {
        return <div>Evento não encontrado.</div>;
    }

    return (
        <>
            <section className="lg:max-w-4xl mx-auto w-full pt-5">
                <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
                <p>{event.description}</p>
                <p>Data do Evento: {formatDate(event.event_date)}</p>
                <div className="mt-8">
                    <EventAssignmentTable allMembers={allMembers || []} assignments={assignments || []} />
                </div>
            </section>
        </>
    )
}

export default EventDetailPage