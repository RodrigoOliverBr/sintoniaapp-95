
import React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContractForm from "./ContractForm";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import { toast } from "sonner";

interface NewContractModalProps {
  formClienteId: string;
  setFormClienteId: (value: string) => void;
  formPlanoId: string;
  setFormPlanoId: (value: string) => void;
  formDataInicio: Date;
  setFormDataInicio: (value: Date) => void;
  formDataFim: Date;
  setFormDataFim: (value: Date) => void;
  formDataPrimeiroVencimento: Date;
  setFormDataPrimeiroVencimento: (value: Date) => void;
  formValorMensal: number;
  setFormValorMensal: (value: number) => void;
  formStatus: StatusContrato;
  setFormStatus: (value: StatusContrato) => void;
  formTaxaImplantacao: number;
  setFormTaxaImplantacao: (value: number) => void;
  formObservacoes: string;
  setFormObservacoes: (value: string) => void;
  formNumeroContrato: string;
  setFormNumeroContrato: (value: string) => void;
  clientes: ClienteSistema[];
  planos: Plano[];
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const NewContractModal: React.FC<NewContractModalProps> = ({
  formClienteId,
  setFormClienteId,
  formPlanoId,
  setFormPlanoId,
  formDataInicio,
  setFormDataInicio,
  formDataFim,
  setFormDataFim,
  formDataPrimeiroVencimento,
  setFormDataPrimeiroVencimento,
  formValorMensal,
  setFormValorMensal,
  formStatus,
  setFormStatus,
  formTaxaImplantacao,
  setFormTaxaImplantacao,
  formObservacoes,
  setFormObservacoes,
  formNumeroContrato,
  setFormNumeroContrato,
  clientes,
  planos,
  isLoading,
  onClose,
  onSave
}) => {
  const validateForm = () => {
    if (!formClienteId) {
      toast.error("Por favor, selecione um cliente");
      return false;
    }
    if (!formPlanoId) {
      toast.error("Por favor, selecione um plano");
      return false;
    }
    if (!formNumeroContrato) {
      toast.error("Por favor, informe o número do contrato");
      return false;
    }
    if (!formDataInicio) {
      toast.error("Por favor, selecione a data de início");
      return false;
    }
    if (!formDataFim) {
      toast.error("Por favor, selecione a data de fim");
      return false;
    }
    if (!formValorMensal || formValorMensal <= 0) {
      toast.error("Por favor, informe um valor mensal válido");
      return false;
    }
    if (!formStatus) {
      toast.error("Por favor, selecione um status");
      return false;
    }
    if (formTaxaImplantacao < 0) {
      toast.error("A taxa de implantação não pode ser negativa");
      return false;
    }
    return true;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    onSave();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Adicionar Novo Contrato</DialogTitle>
        <DialogDescription>
          Preencha as informações do novo contrato. Campos com * são obrigatórios.
        </DialogDescription>
      </DialogHeader>
      <ContractForm
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
      />
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NewContractModal;
