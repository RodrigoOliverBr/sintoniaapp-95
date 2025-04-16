import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fatura, StatusFatura, BatchSelection } from "@/types/admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import InvoiceForm from "./InvoiceForm";
import InvoiceTable from "./InvoiceTable";
import InvoiceSummary from "./InvoiceSummary";
import InvoiceFilters, { Filters } from "./InvoiceFilters";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const InvoiceDashboard: React.FC = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [filteredFaturas, setFilteredFaturas] = useState<Fatura[]>([]);
  const [paginatedFaturas, setPaginatedFaturas] = useState<Fatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Fatura | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<BatchSelection>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [batchDeleteMode, setBatchDeleteMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    updatePagination();
  }, [filteredFaturas, currentPage]);

  useEffect(() => {
    calculateSummary(filteredFaturas);
  }, [filteredFaturas]);

  const updatePagination = () => {
    const totalItems = filteredFaturas.length;
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    
    setTotalPages(calculatedTotalPages);
    
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    const currentPageFaturas = filteredFaturas.slice(startIndex, endIndex);
    setPaginatedFaturas(currentPageFaturas);
    
    setSelectedInvoices({});
  };

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
          contratos (
            numero
          )
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      const mappedFaturas: Fatura[] = faturasData.map(item => ({
        id: item.id,
        numero: item.numero,
        clienteId: item.cliente_id,
        clienteSistemaId: item.cliente_sistema_id,
        contratoId: item.contrato_id || undefined,
        dataEmissao: new Date(item.data_emissao).getTime(),
        dataVencimento: new Date(item.data_vencimento).getTime(),
        valor: Number(item.valor),
        status: item.status as StatusFatura,
        clienteName: item.clientes_sistema?.razao_social,
        contratoNumero: item.contratos?.numero,
        referencia: item.referencia || ""
      }));

      setFaturas(mappedFaturas);
      setFilteredFaturas(mappedFaturas);
      setSelectedInvoices({});
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error("Erro ao carregar faturas");
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...faturas];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (fatura) =>
          (fatura.clienteName?.toLowerCase().includes(searchLower)) ||
          fatura.numero.toLowerCase().includes(searchLower) ||
          (fatura.contratoNumero && fatura.contratoNumero.toLowerCase().includes(searchLower))
      );
    }

    if (filters.status !== "all") {
      result = result.filter((fatura) => fatura.status === filters.status);
    }

    if (filters.year) {
      result = result.filter((fatura) => {
        const year = new Date(fatura.dataVencimento).getFullYear().toString();
        return year === filters.year;
      });
    }

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
    setCurrentPage(1);
  };

  const handleEdit = (invoice: Fatura) => {
    setEditingInvoice(invoice);
    setFormOpen(true);
  };

  const handleDelete = async (invoice: Fatura) => {
    setBatchDeleteMode(false);
    setSelectedInvoices({ [invoice.id]: true });
    setConfirmDeleteOpen(true);
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

  const handleBatchDelete = async () => {
    setIsLoading(true);
    try {
      const idsToDelete = Object.keys(selectedInvoices).filter(id => selectedInvoices[id]);
      
      if (idsToDelete.length === 0) {
        toast.error("Nenhuma fatura selecionada");
        return;
      }
      
      const { error } = await supabase
        .from('faturas')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;
      
      toast.success(`${idsToDelete.length} faturas excluídas com sucesso`);
      fetchFaturas();
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error('Erro ao excluir faturas:', error);
      toast.error("Erro ao excluir faturas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInvoice = (id: string, selected: boolean) => {
    setSelectedInvoices(prev => ({
      ...prev,
      [id]: selected
    }));
  };

  const handleSelectAll = (selected: boolean) => {
    const newSelection: BatchSelection = {};
    
    paginatedFaturas.forEach(fatura => {
      newSelection[fatura.id] = selected;
    });
    
    setSelectedInvoices(newSelection);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxDisplayedPages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
    let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
    
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }
    
    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(currentPage - 1)} 
          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          aria-disabled={currentPage === 1} 
        />
      </PaginationItem>
    );
    
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages - 1) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    pages.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(currentPage + 1)} 
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          aria-disabled={currentPage === totalPages} 
        />
      </PaginationItem>
    );
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>{pages}</PaginationContent>
      </Pagination>
    );
  };

  const addNewInvoice = () => {
    setEditingInvoice(null);
    setFormOpen(true);
  };

  const getSelectedCount = () => {
    return Object.values(selectedInvoices).filter(Boolean).length;
  };

  const allSelected = paginatedFaturas.length > 0 && 
    paginatedFaturas.every(fatura => selectedInvoices[fatura.id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Faturas</h1>
          <p className="text-gray-600">Cadastre e gerencie as faturas dos clientes</p>
        </div>
        <div className="flex items-center gap-2">
          {getSelectedCount() > 0 && (
            <Button 
              variant="destructive" 
              className="flex items-center gap-1" 
              onClick={() => {
                setBatchDeleteMode(true);
                setConfirmDeleteOpen(true);
              }}
            >
              <Trash2 size={16} />
              Excluir {getSelectedCount()} selecionadas
            </Button>
          )}
          <Button className="flex items-center gap-1" onClick={addNewInvoice}>
            <Plus size={16} />
            Nova Fatura
          </Button>
        </div>
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
            invoices={paginatedFaturas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
            selectedInvoices={selectedInvoices}
            onSelectInvoice={handleSelectInvoice}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
          />
          
          {renderPagination()}
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

      <AlertDialog 
        open={confirmDeleteOpen} 
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {batchDeleteMode 
                ? `Excluir ${getSelectedCount()} faturas selecionadas?`
                : "Excluir fatura?"
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {batchDeleteMode 
                ? "Esta ação não pode ser desfeita. As faturas selecionadas serão excluídas permanentemente."
                : "Esta ação não pode ser desfeita. A fatura será excluída permanentemente."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBatchDelete}
              disabled={isLoading} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceDashboard;
