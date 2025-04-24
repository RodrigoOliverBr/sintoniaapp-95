
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Contrato, ClienteSistema, Plano } from "@/types/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractTableProps {
  contratos: Contrato[];
  clientes: ClienteSistema[];
  planos: Plano[];
  onEdit: (contrato: Contrato) => void;
  onDelete: (contrato: Contrato) => void;
  isLoading: boolean;
}

const ContractTable: React.FC<ContractTableProps> = ({ 
  contratos, 
  clientes, 
  planos,
  onEdit,
  onDelete,
  isLoading
}) => {
  // Helper functions
  const getClienteNome = (clienteSistemaId: string) => {
    const cliente = clientes.find(c => c.id === clienteSistemaId);
    return cliente ? cliente.razaoSocial : "Cliente não encontrado";
  };
  
  const getPlanoNome = (planoId: string) => {
    const plano = planos.find(p => p.id === planoId);
    return plano ? plano.nome : "Plano não encontrado";
  };
  
  const formatarData = (data: string | number) => {
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Data de Início</TableHead>
          <TableHead>Data de Fim</TableHead>
          <TableHead>Valor Mensal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contratos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
              Nenhum contrato encontrado.
            </TableCell>
          </TableRow>
        ) : (
          contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell className="font-medium">{getClienteNome(contrato.clienteSistemaId)}</TableCell>
              <TableCell>{getPlanoNome(contrato.planoId)}</TableCell>
              <TableCell>{contrato.dataInicio ? formatarData(contrato.dataInicio) : "N/A"}</TableCell>
              <TableCell>{contrato.dataFim ? formatarData(contrato.dataFim) : "Sem data fim"}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valorMensal)}
              </TableCell>
              <TableCell>
                <Badge variant={
                    contrato.status === "ativo" ? "default" : 
                    contrato.status === "em-analise" ? "secondary" : 
                    "destructive"
                  }>
                  {contrato.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(contrato)}
                    disabled={isLoading}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(contrato)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ContractTable;
