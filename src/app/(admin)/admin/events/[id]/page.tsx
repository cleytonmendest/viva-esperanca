export const dynamic = 'force-dynamic';
import EventAssignmentTable from "@/app/(admin)/admin/events/[id]/components/EventAssignmentTable";
import { getAssignmentsByEventId, getEventById, getAllMembers, getAllTasks } from "@/app/(admin)/admin/lib/data";
import { formatDate } from "@/utils/format";

type Props = { params: Promise<{ id: string }> };

const EventDetailPage = async ({params}: Props) => {
    const { id: eventId } = await params;

    const [event, assignments, allMembers, allTasks] = await Promise.all([
        getEventById(eventId),
        getAssignmentsByEventId(eventId),
        getAllMembers(),
        getAllTasks(),
    ]);

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
                    <EventAssignmentTable
                        allMembers={allMembers || []}
                        assignments={assignments || []}
                        allTasks={allTasks || []}
                        eventId={eventId}
                    />
                </div>
            </section>
        </>
    )
}

export default EventDetailPage