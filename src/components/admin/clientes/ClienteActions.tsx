
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface ClienteActionsProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onNew: () => void;
}

export const ClienteActions: React.FC<ClienteActionsProps> = ({
  searchTerm,
  onSearch,
  onNew
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome ou CNPJ..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button onClick={onNew}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Cliente
      </Button>
    </div>
  );
};
