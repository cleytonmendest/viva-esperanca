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

  const canEdit = useMemo(() => {
    if (!profile) return false
    const allowedRoles: (string | null)[] =[
      "admin",
      "lider_midia",
      "lider_geral",
      "pastor(a)",
    ]
    return allowedRoles.includes(profile.role)
  }, [profile])

  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = new Date(a.event_date).getTime()
        const dateB = new Date(b.event_date).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      })
  }, [initialEvents, searchTerm, sortOrder])

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Mais próximo</SelectItem>
              <SelectItem value="desc">Mais distante</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AddNewEventDialog />
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
