
import React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContractForm from "./ContractForm";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";

interface EditContractModalProps {
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

const EditContractModal: React.FC<EditContractModalProps> = ({
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
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Editar Contrato</DialogTitle>
        <DialogDescription>
          Atualize as informações do contrato.
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
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditContractModal;
