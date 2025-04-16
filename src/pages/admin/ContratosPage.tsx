
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
  
  // Form states
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
  
  // Efeito para atualizar a data de fim quando a data de início mudar
  useEffect(() => {
    // Calcula a data de fim como 12 meses após a data de início
    setFormDataFim(addMonths(formDataInicio, 12));
  }, [formDataInicio]);

  // Efeito para gerar automaticamente o número do contrato ao abrir o modal
  useEffect(() => {
    if (openNewModal) {
      const ano = new Date().getFullYear();
      const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
      setFormNumeroContrato(`CONT-${ano}-${numeroAleatorio}`);
    }
  }, [openNewModal]);
  
  // Efeito para atualizar o valor mensal quando o plano é selecionado
  useEffect(() => {
    if (formPlanoId) {
      const planoSelecionado = planos.find(p => p.id === formPlanoId);
      if (planoSelecionado) {
        setFormValorMensal(planoSelecionado.valorMensal);
        setFormTaxaImplantacao(planoSelecionado.valorImplantacao);
      }
    }
  }, [formPlanoId, planos]);
  
  // Filtragem de contratos
  const filteredContratos = contratos.filter(contrato => {
    const clienteNome = clientes.find(c => c.id === contrato.clienteSistemaId)?.razaoSocial || "";
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
  
  const handleOpenEditModal = (contrato: typeof currentContrato) => {
    if (!contrato) return;
    setCurrentContrato(contrato);
    setFormClienteId(contrato.clienteSistemaId);
    setFormPlanoId(contrato.planoId);
    setFormDataInicio(new Date(contrato.dataInicio));
    setFormDataFim(new Date(contrato.dataFim));
    setFormDataPrimeiroVencimento(new Date(contrato.dataPrimeiroVencimento));
    setFormValorMensal(contrato.valorMensal);
    setFormStatus(contrato.status);
    setFormTaxaImplantacao(contrato.taxaImplantacao);
    setFormObservacoes(contrato.observacoes);
    setFormNumeroContrato(contrato.numero);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (contrato: typeof currentContrato) => {
    if (!contrato) return;
    setCurrentContrato(contrato);
    setOpenDeleteModal(true);
  };

  const handleAddContrato = async () => {
    if (!formClienteId || !formPlanoId || !formNumeroContrato) {
      toast.error("Cliente, Plano e Número do Contrato são obrigatórios");
      return;
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
      setOpenNewModal(false);
      clearForm();
    }
  };
  
  const handleUpdateContrato = async () => {
    if (!currentContrato) return;
    
    const success = await updateContrato(
      currentContrato.id,
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
      setOpenEditModal(false);
      clearForm();
    }
  };
  
  const handleDeleteContrato = async () => {
    if (!currentContrato) return;
    
    const success = await deleteContrato(currentContrato.id, currentContrato.clienteSistemaId);

    if (success) {
      setOpenDeleteModal(false);
    }
  };

  return (
    <AdminLayout title="Contratos">
      <Card>
        <CardHeader>
          <ContractHeader 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
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
            planos={planos}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Modais */}
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
          planos={planos}
          isLoading={isLoading}
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
          planos={planos}
          isLoading={isLoading}
          onClose={() => setOpenEditModal(false)}
          onSave={handleUpdateContrato}
        />
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DeleteContractModal
          isLoading={isLoading}
          onClose={() => setOpenDeleteModal(false)}
          onDelete={handleDeleteContrato}
        />
      </Dialog>
    </AdminLayout>
  );
};

export default ContratosPage;
