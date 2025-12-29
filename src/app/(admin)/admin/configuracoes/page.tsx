import { Settings, Shield, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesManager } from "./components/RolesManager";
import { SectorsManager } from "./components/SectorsManager";
import { getAllRoles, getAllSectors } from "@/lib/permissions";

export default async function ConfiguracoesPage() {
  // Buscar roles e setores
  const [roles, sectors] = await Promise.all([
    getAllRoles(),
    getAllSectors(),
  ]);

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie roles, setores e permissões do sistema
        </p>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Setores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesManager initialRoles={roles} />
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <SectorsManager initialSectors={sectors} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
