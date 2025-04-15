
import React from "react";
import { Fatura, StatusFatura } from "@/types/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Printer, Check, Clock, AlertTriangle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvoicePreviewProps {
  invoice: Fatura;
  onStatusChange?: (fatura: Fatura, newStatus: StatusFatura) => void;
}

const InvoicePreview = ({ invoice, onStatusChange }: InvoicePreviewProps) => {
  const handlePrint = () => {
    window.print();
  };

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

  const getStatusIcon = (status: StatusFatura) => {
    switch (status) {
      case 'pago': return <Check size={14} />;
      case 'pendente': return <Clock size={14} />;
      case 'atrasado': return <AlertTriangle size={14} />;
      case 'programada': return <Ban size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-4 space-y-6 print:p-0">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">FATURA</h1>
          <p className="text-muted-foreground">Nº {invoice.numero}</p>
        </div>
        <div className="text-right">
          <p>Data de Emissão: {format(invoice.dataEmissao, "dd/MM/yyyy", { locale: ptBR })}</p>
          <p>Vencimento: {format(invoice.dataVencimento, "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
      </div>

      <div className="border-t border-b py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Status</h2>
          <Badge variant={getStatusBadgeVariant(invoice.status)} className="flex items-center gap-1">
            {getStatusIcon(invoice.status)}
            {getStatusName(invoice.status)}
          </Badge>
        </div>

        {onStatusChange && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusChange(invoice, 'pago')}
              disabled={invoice.status === 'pago'}
            >
              Marcar como Pago
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusChange(invoice, 'pendente')}
              disabled={invoice.status === 'pendente'}
            >
              Marcar como Pendente
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold">Detalhes do Serviço</h2>
        <div className="border rounded-lg p-4">
          <p>Referência: {invoice.referencia}</p>
          <p className="mt-2">Contrato ID: {invoice.contratoId}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
          <span className="text-lg font-semibold">Valor Total</span>
          <span className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.valor)}
          </span>
        </div>
      </div>
      
      <div className="print:hidden mt-6 flex justify-end">
        <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={16} />
          Imprimir
        </Button>
      </div>
    </div>
  );
};

export default InvoicePreview;
