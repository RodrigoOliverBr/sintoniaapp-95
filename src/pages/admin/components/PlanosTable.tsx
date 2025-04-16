
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Plano } from "@/types/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanosTableProps {
  planos: Plano[];
  onEdit: (plano: Plano) => void;
  onDelete: (plano: Plano) => void;
}

const PlanosTable: React.FC<PlanosTableProps> = ({ planos, onEdit, onDelete }) => {
  const formatarLimiteEmpresas = (plano: Plano) => {
    if (plano.empresasIlimitadas) return "Ilimitadas";
    return plano.limiteEmpresas === 1 ? "1 empresa" : `${plano.limiteEmpresas} empresas`;
  };

  const formatarLimiteEmpregados = (plano: Plano) => {
    if (plano.empregadosIlimitados) return "Ilimitados";
    return `Até ${plano.limiteEmpregados}`;
  };

  const formatarDataValidade = (plano: Plano) => {
    if (plano.semVencimento) return "Sem vencimento";
    if (!plano.dataValidade) return "Não definida";
    return format(new Date(plano.dataValidade), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Valores</TableHead>
          <TableHead>Limites</TableHead>
          <TableHead>Validade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {planos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
              Nenhum plano encontrado.
            </TableCell>
          </TableRow>
        ) : (
          planos.map((plano) => (
            <TableRow key={plano.id}>
              <TableCell className="font-medium">{plano.nome}</TableCell>
              <TableCell className="max-w-[200px] truncate">{plano.descricao}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>
                    Mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorMensal)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Impl: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorImplantacao)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{formatarLimiteEmpresas(plano)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatarLimiteEmpregados(plano)} empregados
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatarDataValidade(plano)}</TableCell>
              <TableCell>
                <Badge variant={plano.ativo ? "default" : "secondary"}>
                  {plano.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(plano)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(plano)}
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

export default PlanosTable;
