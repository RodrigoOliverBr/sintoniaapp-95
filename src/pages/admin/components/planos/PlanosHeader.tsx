
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface PlanosHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewPlano: () => void;
}

const PlanosHeader: React.FC<PlanosHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onNewPlano
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Planos</CardTitle>
          <CardDescription>
            Crie e gerencie os planos oferecidos aos clientes
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={onNewPlano}
        >
          <Plus size={16} />
          Novo Plano
        </Button>
      </div>
      <div className="pt-4">
        <Input
          placeholder="Buscar plano por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xl"
        />
      </div>
    </>
  );
};

export default PlanosHeader;
