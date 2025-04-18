
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente</Label>
        <Select 
          value={formClienteId} 
          onValueChange={(value) => setFormClienteId(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="cliente">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {clientes.map(cliente => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.razao_social}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="plano">Plano</Label>
        <Select 
          value={formPlanoId} 
          onValueChange={(value) => setFormPlanoId(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="plano">
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {planos.map(plano => (
              <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="numeroContrato">Número do Contrato</Label>
        <Input
          id="numeroContrato"
          value={formNumeroContrato}
          onChange={(e) => setFormNumeroContrato(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data de Início</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataInicio && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataInicio ? (
                format(formDataInicio, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataInicio}
              onSelect={(date) => date && setFormDataInicio(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataFim">Data de Fim</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataFim && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataFim ? (
                format(formDataFim, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataFim}
              onSelect={(date) => date && setFormDataFim(date)}
              disabled={(date) => date < formDataInicio}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataPrimeiroVencimento && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataPrimeiroVencimento ? (
                format(formDataPrimeiroVencimento, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataPrimeiroVencimento}
              onSelect={(date) => date && setFormDataPrimeiroVencimento(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="valorMensal">Valor Mensal</Label>
        <Input 
          id="valorMensal" 
          type="number" 
          value={formValorMensal} 
          onChange={(e) => setFormValorMensal(Number(e.target.value))} 
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formStatus} 
          onValueChange={(value: StatusContrato) => setFormStatus(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="em-analise">Em Análise</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="taxaImplantacao">Taxa de Implantação</Label>
        <Input 
          id="taxaImplantacao" 
          type="number" 
          value={formTaxaImplantacao} 
          onChange={(e) => setFormTaxaImplantacao(Number(e.target.value))} 
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Input 
          id="observacoes" 
          value={formObservacoes} 
          onChange={(e) => setFormObservacoes(e.target.value)} 
          disabled={isLoading}
        />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default ContractForm;
