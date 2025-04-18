import React from "react";
import { Button } from "@/components/ui/button";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ClientePlanoPicker from "./form-sections/ClientePlanoPicker";
import ContractDates from "./form-sections/ContractDates";
import ContractValues from "./form-sections/ContractValues";

interface ContractFormProps {
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
}

const ContractForm: React.FC<ContractFormProps> = ({
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
}) => {
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formClienteId) {
      toast.error("Por favor, selecione um cliente");
      return false;
    }
    if (!formPlanoId) {
      toast.error("Por favor, selecione um plano");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const { data: existingContracts, error: checkError } = await supabase
        .from('contratos')
        .select('id')
        .eq('cliente_sistema_id', formClienteId)
        .eq('status', 'ativo');

      if (checkError) throw checkError;

      if (existingContracts && existingContracts.length > 0) {
        toast.error("Este cliente já possui um contrato ativo");
        return;
      }

      const { data, error } = await supabase
        .from('contratos')
        .insert({
          cliente_sistema_id: formClienteId,
          cliente_id: formClienteId,
          plano_id: formPlanoId,
          data_inicio: formDataInicio.toISOString(),
          data_fim: formDataFim.toISOString(),
          data_primeiro_vencimento: formDataPrimeiroVencimento.toISOString(),
          valor_mensal: formValorMensal,
          status: formStatus,
          taxa_implantacao: formTaxaImplantacao,
          observacoes: formObservacoes,
          numero: formNumeroContrato,
          ciclo_faturamento: 'mensal'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Contrato criado com sucesso!");
      navigate("/admin/contratos");

    } catch (error: any) {
      console.error("Erro ao criar contrato:", error);
      toast.error(error.message || "Erro ao criar contrato");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <ClientePlanoPicker
        formClienteId={formClienteId}
        setFormClienteId={setFormClienteId}
        formPlanoId={formPlanoId}
        setFormPlanoId={setFormPlanoId}
        clientes={clientes}
        planos={planos}
        isLoading={isLoading}
      />
      <ContractDates
        formDataInicio={formDataInicio}
        setFormDataInicio={setFormDataInicio}
        formDataFim={formDataFim}
        setFormDataFim={setFormDataFim}
        formDataPrimeiroVencimento={formDataPrimeiroVencimento}
        setFormDataPrimeiroVencimento={setFormDataPrimeiroVencimento}
        isLoading={isLoading}
      />
      <ContractValues
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
        isLoading={isLoading}
      />
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default ContractForm;
