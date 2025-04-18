import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import ContractForm from "./ContractForm";
import ContractDialogHeader from "./dialog-sections/ContractDialogHeader";
import ContractDialogFooter from "./dialog-sections/ContractDialogFooter";

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
  onSave,
}) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <ContractDialogHeader />
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
      <ContractDialogFooter
        onClose={onClose}
        onSave={onSave}
        isLoading={isLoading}
      />
    </DialogContent>
  );
};

export default NewContractModal;
