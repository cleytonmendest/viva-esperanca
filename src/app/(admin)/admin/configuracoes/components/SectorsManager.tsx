"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";
import { AddSectorDialog } from "./AddSectorDialog";
import { EditSectorDialog } from "./EditSectorDialog";
import { DeleteSectorDialog } from "./DeleteSectorDialog";
import * as Icons from "lucide-react";

type Sector = Tables<'sectors'>;

interface SectorsManagerProps {
  initialSectors: Sector[];
}

export function SectorsManager({ initialSectors }: SectorsManagerProps) {
  const [sectors] = useState<Sector[]>(initialSectors);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);

  const renderIcon = (iconName: string | null, className: string, color?: string | null) => {
    const iconKey = iconName || 'Users';
    const Icon = Icons[iconKey as keyof typeof Icons] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

    if (!Icon || typeof Icon !== 'function' || Icon.length > 1) {
      const DefaultIcon = Icons.Users;
      return <DefaultIcon className={className} style={{ color: color || undefined }} />;
    }

    return <Icon className={className} style={{ color: color || undefined }} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Setores</CardTitle>
            <CardDescription>
              Crie e gerencie os setores da igreja
            </CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Setor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ícone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum setor encontrado
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => {
                return (
                  <TableRow key={sector.id}>
                    <TableCell>
                      {renderIcon(sector.icon, "h-5 w-5", sector.color)}
                    </TableCell>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sector.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: sector.color || undefined }}>
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: sector.color || '#3B82F6' }}
                        />
                        {sector.color}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSector(sector)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingSector(sector)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialogs */}
      <AddSectorDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {editingSector && (
        <EditSectorDialog
          sector={editingSector}
          open={!!editingSector}
          onOpenChange={(open) => !open && setEditingSector(null)}
        />
      )}
      {deletingSector && (
        <DeleteSectorDialog
          sector={deletingSector}
          open={!!deletingSector}
          onOpenChange={(open) => !open && setDeletingSector(null)}
        />
      )}
    </Card>
  );
}
