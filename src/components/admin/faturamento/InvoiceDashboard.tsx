
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fatura, StatusFatura } from "@/types/admin";

import InvoiceForm from "./InvoiceForm";
import InvoiceTable from "./InvoiceTable";
import InvoiceSummary from "./InvoiceSummary";
import InvoiceFilters, { Filters } from "./InvoiceFilters";

const InvoiceDashboard: React.FC = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [filteredFaturas, setFilteredFaturas] = useState<Fatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Fatura | null>(null);
  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    totalCount: 0,
    paidValue: 0,
    paidCount: 0,
    pendingValue: 0,
    pendingCount: 0,
    lateValue: 0,
    lateCount: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    month: "all",
    status: "all",
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchFaturas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [faturas, filters]);

  useEffect(() => {
    calculateSummary(filteredFaturas);
  }, [filteredFaturas]);

  const fetchFaturas = async () => {
    setIsLoading(true);
    try {
      const { data: faturasData, error } = await supabase
        .from('faturas')
        .select(`
          *,
          clientes_sistema!inner (
            razao_social
          ),
          contratos!inner (
            numero
          )
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      // Map the data to match our Fatura type
      const mappedFaturas: Fatura[] = faturasData.map(item => ({
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
        clienteName: item.clientes_sistema.razao_social,
        contratoNumero: item.contratos.numero
      }));

      setFaturas(mappedFaturas);
      setFilteredFaturas(mappedFaturas);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error("Erro ao carregar faturas");
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...faturas];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (fatura) =>
          fatura.clienteName?.toLowerCase().includes(searchLower) ||
          fatura.numero.toLowerCase().includes(searchLower) ||
          fatura.contratoNumero?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((fatura) => fatura.status === filters.status);
    }

    // Apply year filter
    if (filters.year) {
      result = result.filter((fatura) => {
        const year = new Date(fatura.dataVencimento).getFullYear().toString();
        return year === filters.year;
      });
    }

    // Apply month filter
    if (filters.month !== "all") {
      result = result.filter((fatura) => {
        const month = new Date(fatura.dataVencimento).getMonth() + 1;
        return month.toString().padStart(2, "0") === filters.month;
      });
    }

    setFilteredFaturas(result);
  };

  const calculateSummary = (invoices: Fatura[]) => {
    const summary = {
      totalValue: 0,
      totalCount: invoices.length,
      paidValue: 0,
      paidCount: 0,
      pendingValue: 0,
      pendingCount: 0,
      lateValue: 0,
      lateCount: 0,
    };

    invoices.forEach((invoice) => {
      const amount = invoice.valor;
      summary.totalValue += amount;

      switch (invoice.status) {
        case "pago":
          summary.paidValue += amount;
          summary.paidCount += 1;
          break;
        case "pendente":
          summary.pendingValue += amount;
          summary.pendingCount += 1;
          break;
        case "atrasado":
          summary.lateValue += amount;
          summary.lateCount += 1;
          break;
      }
    });

    setSummaryData(summary);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleEdit = (invoice: Fatura) => {
    setEditingInvoice(invoice);
    setFormOpen(true);
  };

  const handleDelete = async (invoice: Fatura) => {
    try {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', invoice.id);

      if (error) throw error;
      
      toast.success("Fatura excluída com sucesso");
      fetchFaturas();
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
      toast.error("Erro ao excluir fatura");
    }
  };

  const handleStatusChange = async (invoice: Fatura, newStatus: StatusFatura) => {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({ status: newStatus })
        .eq('id', invoice.id);

      if (error) throw error;
      
      toast.success(`Fatura marcada como ${newStatus}`);
      fetchFaturas();
    } catch (error) {
      console.error('Erro ao atualizar status da fatura:', error);
      toast.error("Erro ao atualizar status da fatura");
    }
  };

  const addNewInvoice = () => {
    setEditingInvoice(null);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Faturas</h1>
          <p className="text-gray-600">Cadastre e gerencie as faturas dos clientes</p>
        </div>
        <Button className="flex items-center gap-1" onClick={addNewInvoice}>
          <Plus size={16} />
          Nova Fatura
        </Button>
      </div>

      <Tabs defaultValue="faturas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="visao-mensal">Visão Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="space-y-4">
          <InvoiceFilters onFilterChange={handleFilterChange} />
          
          <InvoiceSummary
            totalValue={summaryData.totalValue}
            totalCount={summaryData.totalCount}
            paidValue={summaryData.paidValue}
            paidCount={summaryData.paidCount}
            pendingValue={summaryData.pendingValue}
            pendingCount={summaryData.pendingCount}
            lateValue={summaryData.lateValue}
            lateCount={summaryData.lateCount}
          />
          
          <InvoiceTable
            invoices={filteredFaturas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="visao-mensal">
          <div className="text-center py-10 text-gray-500">
            Visualização mensal será implementada em breve.
          </div>
        </TabsContent>
      </Tabs>

      <InvoiceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchFaturas}
        editingInvoice={editingInvoice}
      />
    </div>
  );
};

export default InvoiceDashboard;
