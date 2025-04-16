
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface ContractHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewContract?: () => void;
}

const ContractHeader: React.FC<ContractHeaderProps> = ({ 
  searchTerm, 
  onSearchChange,
  onNewContract 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Gerenciamento de Contratos</CardTitle>
        <CardDescription>
          Cadastre e gerencie os contratos dos clientes
        </CardDescription>
      </div>
      <Button onClick={onNewContract}>Novo Contrato</Button>
    </div>
  );
};

export const ContractSearch: React.FC<ContractHeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="pt-4">
      <Input
        placeholder="Buscar contrato por cliente ou número..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xl"
      />
    </div>
  );
};

export default ContractHeader;
