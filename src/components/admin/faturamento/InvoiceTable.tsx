
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileCheck, FileX, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Fatura, StatusFatura } from "@/types/admin";

interface InvoiceTableProps {
  invoices: Fatura[];
  onEdit: (invoice: Fatura) => void;
  onDelete: (invoice: Fatura) => void;
  onStatusChange: (invoice: Fatura, newStatus: StatusFatura) => void;
  isLoading: boolean;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ 
  invoices, 
  onEdit, 
  onDelete, 
  onStatusChange,
  isLoading
}) => {
  const getStatusBadgeVariant = (status: StatusFatura) => {
    switch (status) {
      case 'pago': return 'default';
      case 'pendente': return 'warning';
      case 'atrasado': return 'destructive';
      case 'programada': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusName = (status: StatusFatura) => {
    const statusNames = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      programada: 'Programada',
    };
    return statusNames[status] || status;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Carregando faturas...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Nenhuma fatura encontrada para os filtros aplicados.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </TableHead>
          <TableHead>Número</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Contrato</TableHead>
          <TableHead>Referência</TableHead>
          <TableHead>Emissão</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </TableCell>
            <TableCell className="font-medium">{invoice.numero}</TableCell>
            <TableCell>
              {invoice.clienteName || 'Cliente não informado'}
            </TableCell>
            <TableCell>
              {invoice.contratoNumero || 'Contrato não informado'}
            </TableCell>
            <TableCell>{invoice.referencia}</TableCell>
            <TableCell>
              {format(invoice.dataEmissao, 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell>
              {format(invoice.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell>{formatCurrency(invoice.valor)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {getStatusName(invoice.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(invoice)}
                >
                  <Pencil size={16} />
                </Button>
                
                {invoice.status === 'pendente' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onStatusChange(invoice, 'pago')}
                  >
                    <FileCheck size={16} />
                  </Button>
                )}
                
                {invoice.status === 'pago' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                    onClick={() => onStatusChange(invoice, 'pendente')}
                  >
                    <FileX size={16} />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(invoice)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InvoiceTable;
