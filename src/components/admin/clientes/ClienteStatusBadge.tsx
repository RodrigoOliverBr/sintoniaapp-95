
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ClienteComContrato } from "@/types/admin";

interface ClienteStatusBadgeProps {
  cliente: ClienteComContrato;
}

export const ClienteStatusBadge: React.FC<ClienteStatusBadgeProps> = ({ cliente }) => {
  switch (cliente.situacao) {
    case 'ativo':
      return <Badge variant="default">Ativo</Badge>;
    case 'em-analise':
      return <Badge variant="secondary">Em análise</Badge>;
    case 'bloqueado-manualmente':
      return <Badge variant="destructive">Bloqueado Manualmente</Badge>;
    case 'sem-contrato':
      return <Badge variant="outline">Sem contrato</Badge>;
    default:
      if (cliente.statusContrato === 'vencimento-proximo') {
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">
            Vencimento em {cliente.diasParaVencimento} dias
          </Badge>
        );
      }
      return (
        <Badge variant={cliente.situacao === "liberado" ? "default" : "destructive"}>
          {cliente.situacao === "liberado" ? "Liberado" : "Bloqueado"}
        </Badge>
      );
  }
};
