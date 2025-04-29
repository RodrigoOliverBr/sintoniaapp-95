
import React from "react";
import { Plano } from "@/types/admin";
import PlanosTable from "../PlanosTable";

interface PlanosContentProps {
  planos: Plano[];
  searchTerm: string;
  onEdit: (plano: Plano) => void;
  onDelete: (plano: Plano) => void;
}

const PlanosContent: React.FC<PlanosContentProps> = ({ 
  planos, 
  searchTerm,
  onEdit,
  onDelete
}) => {
  const filteredPlanos = planos.filter(plano => 
    plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plano.descricao && plano.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PlanosTable 
      planos={filteredPlanos} 
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default PlanosContent;
