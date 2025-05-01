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
  validateForm?: () => boolean;
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
  console.log("Rendering ContractForm with data:", {
    formClienteId,
    formPlanoId,
    formNumeroContrato,
    clientesLength: clientes?.length,
    planosLength: planos?.length
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente *</Label>
        <Select 
          value={formClienteId} 
          onValueChange={(value) => setFormClienteId(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="cliente" className="text-sm bg-white">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
            {clientes && clientes.length > 0 ? (
              clientes.map(cliente => (
                <SelectItem 
                  key={cliente.id} 
                  value={cliente.id}
                  className="py-2 px-4 hover:bg-gray-100 text-sm"
                >
                  {cliente.razao_social || cliente.nome}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-clients" disabled className="text-sm">
                Nenhum cliente disponível
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="plano">Plano *</Label>
        <Select 
          value={formPlanoId} 
          onValueChange={(value) => setFormPlanoId(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="plano" className="text-sm bg-white">
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {planos.map(plano => (
              <SelectItem key={plano.id} value={plano.id} className="text-sm">
                {plano.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="numeroContrato">Número do Contrato *</Label>
        <Input
          id="numeroContrato"
          value={formNumeroContrato}
          onChange={(e) => setFormNumeroContrato(e.target.value)}
          disabled={isLoading}
          className="text-sm"
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
                "w-full justify-start text-left font-normal bg-white text-sm",
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
                "w-full justify-start text-left font-normal bg-white text-sm",
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
                "w-full justify-start text-left font-normal bg-white text-sm",
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
          className="bg-white text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select 
          value={formStatus} 
          onValueChange={(value: StatusContrato) => setFormStatus(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="status" className="bg-white text-sm">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ativo" className="text-sm">Ativo</SelectItem>
            <SelectItem value="em-analise" className="text-sm">Em Análise</SelectItem>
            <SelectItem value="cancelado" className="text-sm">Cancelado</SelectItem>
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
          className="bg-white text-sm"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Input 
          id="observacoes" 
          value={formObservacoes} 
          onChange={(e) => setFormObservacoes(e.target.value)} 
          disabled={isLoading}
          className="bg-white text-sm"
        />
      </div>
    </div>
  );
};

export default ContractForm;
