
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusContrato } from "@/types/admin";

interface ContractValuesProps {
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
  isLoading: boolean;
}

const ContractValues: React.FC<ContractValuesProps> = ({
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
  isLoading,
}) => {
  return (
    <>
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
    </>
  );
};

export default ContractValues;
