
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { addMonths } from "date-fns";
import { StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { useContratos } from "@/hooks/useContratos";
import ContractTable from "@/components/admin/contratos/ContractTable";
import ContractHeader, { ContractSearch } from "@/components/admin/contratos/ContractHeader";
import NewContractModal from "@/components/admin/contratos/NewContractModal";
import EditContractModal from "@/components/admin/contratos/EditContractModal";
import DeleteContractModal from "@/components/admin/contratos/DeleteContractModal";

const ContratosPage: React.FC = () => {
  const { 
    contratos, 
    clientes, 
    planos, 
    loading: loadingData,
    isLoading,
    currentContrato,
    setCurrentContrato,
    addContrato,
    updateContrato,
    deleteContrato
  } = useContratos();
  
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formClienteId, setFormClienteId] = useState("");
  const [formPlanoId, setFormPlanoId] = useState("");
  const [formDataInicio, setFormDataInicio] = useState<Date>(new Date());
  const [formDataFim, setFormDataFim] = useState<Date>(addMonths(new Date(), 12));
  const [formDataPrimeiroVencimento, setFormDataPrimeiroVencimento] = useState<Date>(new Date());
  const [formValorMensal, setFormValorMensal] = useState(0);
  const [formStatus, setFormStatus] = useState<StatusContrato>("ativo");
  const [formTaxaImplantacao, setFormTaxaImplantacao] = useState(0);
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formNumeroContrato, setFormNumeroContrato] = useState("");
  
  useEffect(() => {
    setFormDataFim(addMonths(formDataInicio, 12));
  }, [formDataInicio]);

  useEffect(() => {
    if (openNewModal) {
      const ano = new Date().getFullYear();
      const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
      setFormNumeroContrato(`CONT-${ano}-${numeroAleatorio}`);
    }
  }, [openNewModal]);
  
  useEffect(() => {
    if (formPlanoId && planos) {
      const planoSelecionado = planos.find(p => p.id === formPlanoId);
      if (planoSelecionado) {
        setFormValorMensal(planoSelecionado.valorMensal);
        setFormTaxaImplantacao(planoSelecionado.valorImplantacao);
      }
    }
  }, [formPlanoId, planos]);
  
  const filteredContratos = contratos.filter(contrato => {
    const clienteNome = clientes.find(c => c.id === contrato.clienteSistemaId)?.razao_social || "";
    return clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contrato.numero.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const clearForm = () => {
    setFormClienteId("");
    setFormPlanoId("");
    setFormDataInicio(new Date());
    setFormDataFim(addMonths(new Date(), 12));
    setFormDataPrimeiroVencimento(new Date());
    setFormValorMensal(0);
    setFormStatus("ativo");
    setFormTaxaImplantacao(0);
    setFormObservacoes("");
    const ano = new Date().getFullYear();
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    setFormNumeroContrato(`CONT-${ano}-${numeroAleatorio}`);
  };
  
  const handleOpenNewModal = () => {
    clearForm();
    setOpenNewModal(true);
  };
  
  const handleOpenEditModal = (contrato: typeof currentContrato) => {
    if (!contrato) return;
    setCurrentContrato(contrato);
    setFormClienteId(contrato.clienteSistemaId || contrato.clienteId);
    setFormPlanoId(contrato.planoId);
    setFormDataInicio(new Date(contrato.dataInicio));
    setFormDataFim(new Date(contrato.dataFim || Date.now()));
    setFormDataPrimeiroVencimento(new Date(contrato.dataPrimeiroVencimento));
    setFormValorMensal(contrato.valorMensal);
    setFormStatus(contrato.status as StatusContrato);
    setFormTaxaImplantacao(contrato.taxaImplantacao);
    setFormObservacoes(contrato.observacoes || '');
    setFormNumeroContrato(contrato.numero);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (contrato: typeof currentContrato) => {
    if (!contrato) return;
    setCurrentContrato(contrato);
    setOpenDeleteModal(true);
  };

  const verificarContratoAtivoExistente = async (clienteId: string) => {
    const contratosDoCliente = contratos.filter(c => 
      c.clienteSistemaId === clienteId && c.status === 'ativo'
    );
    
    if (contratosDoCliente.length > 0) {
      if (!currentContrato || (currentContrato && currentContrato.id !== contratosDoCliente[0].id)) {
        return true;
      }
    }
    
    return false;
  };

  const handleAddContrato = async () => {
    try {
      if (formStatus === 'ativo') {
        const contratoAtivoExiste = await verificarContratoAtivoExistente(formClienteId);
        if (contratoAtivoExiste) {
          toast.error("Este cliente já possui um contrato ativo. Por favor, cancele o contrato existente antes de criar um novo.");
          return;
        }
      }

      const success = await addContrato(
        formClienteId,
        formPlanoId,
        formNumeroContrato,
        formDataInicio,
        formDataFim,
        formDataPrimeiroVencimento,
        formValorMensal,
        formStatus,
        formTaxaImplantacao,
        formObservacoes
      );

      if (success) {
        toast.success("Contrato adicionado com sucesso!");
        setOpenNewModal(false);
        clearForm();
      } else {
        toast.error("Erro ao salvar o contrato. Verifique os dados e tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar contrato:", error);
      toast.error(`Erro ao adicionar contrato: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  const handleUpdateContrato = async () => {
    try {
      if (!currentContrato) {
        toast.error("Nenhum contrato selecionado para edição");
        return;
      }
      
      if (formStatus === 'ativo' && currentContrato.status !== 'ativo') {
        const contratoAtivoExiste = await verificarContratoAtivoExistente(formClienteId);
        if (contratoAtivoExiste) {
          toast.error("Este cliente já possui um contrato ativo. Por favor, cancele o contrato existente antes de ativar este.");
          return;
        }
      }
      
      // Create an update object with the necessary fields
      const updates = {
        clienteSistemaId: formClienteId,
        planoId: formPlanoId,
        numero: formNumeroContrato,
        dataInicio: formDataInicio.getTime(),
        dataFim: formDataFim.getTime(),
        dataPrimeiroVencimento: formDataPrimeiroVencimento.getTime(),
        valorMensal: formValorMensal,
        status: formStatus,
        taxaImplantacao: formTaxaImplantacao,
        observacoes: formObservacoes
      };
      
      const success = await updateContrato(currentContrato.id, updates);

      if (success) {
        toast.success("Contrato atualizado com sucesso!");
        setOpenEditModal(false);
        clearForm();
      } else {
        toast.error("Erro ao atualizar o contrato. Verifique os dados e tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error(`Erro ao atualizar contrato: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  const handleDeleteContrato = async () => {
    try {
      if (!currentContrato) {
        toast.error("Nenhum contrato selecionado para exclusão");
        return;
      }
      
      const success = await deleteContrato(currentContrato.id);

      if (success) {
        toast.success("Contrato excluído com sucesso!");
        setOpenDeleteModal(false);
      } else {
        toast.error("Erro ao excluir o contrato.");
      }
    } catch (error: any) {
      console.error("Erro ao excluir contrato:", error);
      toast.error(`Erro ao excluir contrato: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <AdminLayout title="Contratos">
      <Card>
        <CardHeader>
          <ContractHeader 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            onNewContract={handleOpenNewModal}
          />
          <ContractSearch 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
        </CardHeader>
        <CardContent>
          <ContractTable 
            contratos={filteredContratos}
            clientes={clientes}
            planos={planos || []}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            isLoading={isLoading || loadingData}
          />
        </CardContent>
      </Card>
      
      <Dialog open={openNewModal} onOpenChange={(open) => {
        setOpenNewModal(open);
        if (!open) clearForm();
      }}>
        <NewContractModal
          formClienteId={formClienteId}
          setFormClienteId={setFormClienteId}
          formPlanoId={formPlanoId}
          setFormPlanoId={setFormPlanoId}
          formDataInicio={formDataInicio}
          setFormDataInicio={setFormDataInicio}
          formDataFim={formDataFim}
          setFormDataFim={setFormDataFim}
          formDataPrimeiroVencimento={formDataPrimeiroVencimento}
          setFormDataPrimeiroVencimento={setFormDataPrimeiroVencimento}
          formValorMensal={formValorMensal}
          setFormValorMensal={setFormValorMensal}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formTaxaImplantacao={formTaxaImplantacao}
          setFormTaxaImplantacao={setFormTaxaImplantacao}
          formObservacoes={formObservacoes}
          setFormObservacoes={setFormObservacoes}
          formNumeroContrato={formNumeroContrato}
          setFormNumeroContrato={setFormNumeroContrato}
          clientes={clientes}
          planos={planos || []}
          isLoading={isLoading || loadingData}
          onClose={() => setOpenNewModal(false)}
          onSave={handleAddContrato}
        />
      </Dialog>
      
      <Dialog open={openEditModal} onOpenChange={(open) => {
        setOpenEditModal(open);
        if (!open) clearForm();
      }}>
        <EditContractModal
          formClienteId={formClienteId}
          setFormClienteId={setFormClienteId}
          formPlanoId={formPlanoId}
          setFormPlanoId={setFormPlanoId}
          formDataInicio={formDataInicio}
          setFormDataInicio={setFormDataInicio}
          formDataFim={formDataFim}
          setFormDataFim={setFormDataFim}
          formDataPrimeiroVencimento={formDataPrimeiroVencimento}
          setFormDataPrimeiroVencimento={setFormDataPrimeiroVencimento}
          formValorMensal={formValorMensal}
          setFormValorMensal={setFormValorMensal}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formTaxaImplantacao={formTaxaImplantacao}
          setFormTaxaImplantacao={setFormTaxaImplantacao}
          formObservacoes={formObservacoes}
          setFormObservacoes={setFormObservacoes}
          formNumeroContrato={formNumeroContrato}
          setFormNumeroContrato={setFormNumeroContrato}
          clientes={clientes}
          planos={planos || []}
          isLoading={isLoading || loadingData}
          onClose={() => setOpenEditModal(false)}
          onSave={handleUpdateContrato}
        />
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DeleteContractModal
          isLoading={isLoading || loadingData}
          onClose={() => setOpenDeleteModal(false)}
          onDelete={handleDeleteContrato}
        />
      </Dialog>
    </AdminLayout>
  );
};

export default ContratosPage;
