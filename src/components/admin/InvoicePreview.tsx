
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Fatura, ClienteSistema, Contrato } from "@/types/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface InvoicePreviewProps {
  fatura: Fatura;
  cliente: ClienteSistema;
  contrato: Contrato;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoicePreview = ({ fatura, cliente, contrato, open, onOpenChange }: InvoicePreviewProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl print:shadow-none print:border-none" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="p-8 space-y-6 print:p-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">FATURA</h1>
              <p className="text-muted-foreground">Nº {fatura.numero}</p>
            </div>
            <div className="text-right">
              <p>Data de Emissão: {format(new Date(fatura.dataEmissao), "dd/MM/yyyy", { locale: ptBR })}</p>
              <p>Vencimento: {format(new Date(fatura.dataVencimento), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>

          <div className="border-t border-b py-4 space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Dados do Cliente</h2>
              <p>{cliente.razaoSocial}</p>
              <p>CNPJ: {cliente.cnpj}</p>
              <p>{cliente.endereco || "Endereço não informado"}</p>
              <p>{cliente.cidade || "Cidade não informada"} - {cliente.estado || "Estado não informado"}, CEP: {cliente.cep || "CEP não informado"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold">Detalhes do Serviço</h2>
            <div className="border rounded-lg p-4">
              <p>Contrato Nº {contrato.numero}</p>
              <p className="mt-2">Período de Referência: {fatura.referencia}</p>
              <p>Plano: {contrato.cicloFaturamento}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
              <span className="text-lg font-semibold">Valor Total</span>
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fatura.valor)}
              </span>
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>Para dúvidas ou informações adicionais, entre em contato:</p>
            <p>Email: financeiro@empresa.com.br</p>
            <p>Telefone: (11) 1234-5678</p>
          </div>
          
          <div className="print:hidden mt-6 flex justify-end">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;
