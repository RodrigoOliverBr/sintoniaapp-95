
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, FileCheck, FileX } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Fatura, StatusFatura, Contrato, StatusContrato, CicloFaturamento } from "@/types/admin";
import InvoicePreview from "@/components/admin/InvoicePreview";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const FaturamentoPage = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

  useEffect(() => {
    fetchFaturas();
    fetchContratos();
  }, []);

  const fetchFaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      const mappedFaturas: Fatura[] = data.map(item => ({
        id: item.id,
        numero: item.numero,
        clienteId: item.cliente_id,
        clienteSistemaId: item.cliente_sistema_id,
        contratoId: item.contrato_id,
        dataEmissao: new Date(item.data_emissao).getTime(),
        dataVencimento: new Date(item.data_vencimento).getTime(),
        valor: Number(item.valor),
        status: item.status as StatusFatura,
        referencia: item.referencia || '',
      }));

      setFaturas(mappedFaturas);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error("Erro ao carregar faturas");
      setIsLoading(false);
    }
  };

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*');

      if (error) throw error;

      const mappedContratos: Contrato[] = data.map(item => ({
        id: item.id,
        numero: item.numero,
        clienteSistemaId: item.cliente_sistema_id,
        clienteId: item.cliente_id,
        planoId: item.plano_id,
        dataInicio: new Date(item.data_inicio).getTime(),
        dataFim: new Date(item.data_fim).getTime(),
        dataPrimeiroVencimento: new Date(item.data_primeiro_vencimento).getTime(),
        valorMensal: Number(item.valor_mensal),
        status: item.status as StatusContrato,
        taxaImplantacao: Number(item.taxa_implantacao),
        observacoes: item.observacoes || '',
        cicloFaturamento: item.ciclo_faturamento as CicloFaturamento,
        proximaRenovacao: item.proxima_renovacao ? new Date(item.proxima_renovacao).getTime() : undefined,
        ciclosGerados: item.ciclos_gerados,
      }));

      setContratos(mappedContratos);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  };

  const handleStatusChange = async (fatura: Fatura, newStatus: StatusFatura) => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({ status: newStatus })
        .eq('id', fatura.id);

      if (error) throw error;

      const statusMessages = {
        pendente: 'Fatura marcada como pendente',
        pago: 'Fatura marcada como paga',
        atrasado: 'Fatura marcada como atrasada',
        programada: 'Fatura marcada como programada',
      };

      toast.success(statusMessages[newStatus]);
      fetchFaturas();
    } catch (error) {
      console.error('Erro ao atualizar status da fatura:', error);
      toast.error("Erro ao atualizar status da fatura");
    }
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

  const handleAddFatura = async () => {
    try {
      // Implementação de adição de fatura (mock para exemplo)
      const novaFatura = {
        contratoId: "contrato-id-exemplo",
        clienteSistemaId: "cliente-id-exemplo",
        dataVencimento: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dias a partir de agora
        valor: 1000,
        status: 'pendente' as StatusFatura,
      };

      toast.success("Fatura adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar fatura:', error);
      toast.error("Erro ao adicionar fatura");
    }
  };

  return (
    <AdminLayout title="Faturamento">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Faturas</CardTitle>
              <CardDescription>
                Visualize e gerencie as faturas dos clientes
              </CardDescription>
            </div>
            <Button className="flex items-center gap-2" onClick={handleAddFatura}>
              <Plus size={16} />
              Nova Fatura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Data Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Carregando faturas...
                  </TableCell>
                </TableRow>
              ) : faturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                faturas.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell className="font-medium">{fatura.numero}</TableCell>
                    <TableCell>{fatura.referencia}</TableCell>
                    <TableCell>
                      {format(fatura.dataEmissao, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(fatura.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(fatura.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(fatura.status)}>
                        {getStatusName(fatura.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Visualizar Fatura"
                              onClick={() => setSelectedFatura(fatura)}
                            >
                              <Pencil size={16} />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle>Detalhes da Fatura</SheetTitle>
                              <SheetDescription>
                                Visualize e atualize informações da fatura.
                              </SheetDescription>
                            </SheetHeader>
                            {selectedFatura && (
                              <InvoicePreview 
                                invoice={selectedFatura} 
                                onStatusChange={handleStatusChange}
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                        {fatura.status === 'pendente' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500"
                            title="Marcar como Paga"
                            onClick={() => handleStatusChange(fatura, 'pago')}
                          >
                            <FileCheck size={16} />
                          </Button>
                        )}
                        {fatura.status === 'pago' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-500"
                            title="Marcar como Pendente"
                            onClick={() => handleStatusChange(fatura, 'pendente')}
                          >
                            <FileX size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default FaturamentoPage;
