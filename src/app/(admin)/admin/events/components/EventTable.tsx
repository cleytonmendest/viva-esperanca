"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/utils/format"
import { Tables } from "@/libs/supabase/database.types"
import { useAuthStore } from "@/stores/authStore"
import AddNewEventDialog from "./AddEventDialog"
import EditNewEventDialog from "./EditEventDialog"

type Event = Tables<"events">

interface EventTableProps {
  initialEvents: Event[]
}

const EventTable = ({ initialEvents }: EventTableProps) => {
  const { profile } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showPastEvents, setShowPastEvents] = useState(false)

  const canEdit = useMemo(() => {
    if (!profile) return false
    const allowedRoles: (string | null)[] = [
      "admin",
      "lider_midia",
      "lider_geral",
      "pastor(a)",
    ]
    return allowedRoles.includes(profile.role)
  }, [profile])

  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return initialEvents
      .filter((event) => {
        if (showPastEvents) return true
        const eventDate = new Date(event.event_date)
        return eventDate >= today
      })
      .filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = new Date(a.event_date).getTime()
        const dateB = new Date(b.event_date).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      })
  }, [initialEvents, searchTerm, sortOrder, showPastEvents])

  return (
    <>
      <div className="flex flex-col-reverse gap-6 mb-4 ">
        <div className="flex flex-col lg:flex-row gap-2.5 items-end">
          <div className="flex gap-2.5 w-full max-w-2xl">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search-event">Buscar</Label>
              <Input
                id="search-event"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="sort-order">Ordenar</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sort-order" className="w-full">
                  <SelectValue placeholder="Ordenar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Mais próximo</SelectItem>
                  <SelectItem value="desc">Mais distante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              id="show-past-events-table"
              checked={showPastEvents}
              onChange={(e) => setShowPastEvents(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="show-past-events-table">Mostrar passados</Label>
          </div>
        </div>
        <div className="flex items-end">
          <AddNewEventDialog />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data</TableHead>
            {canEdit && <TableHead>Editar</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Link href={`/admin/events/${event.id}`}>{event.name}</Link>
              </TableCell>
              <TableCell>{formatDateTime(event.event_date)}</TableCell>
              {canEdit && (
                <TableCell>
                  <EditNewEventDialog event={event} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default EventTable
