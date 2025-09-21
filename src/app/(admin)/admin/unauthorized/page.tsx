import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground mb-6">
            Você não tem permissão para visualizar esta página.
        </p>
        <Button asChild>
            <Link href="/admin">Voltar para a Página Inicial</Link>
        </Button>
    </div>
  );
};

export default UnauthorizedPage;
