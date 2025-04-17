
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, Ban, Pencil, Trash2 } from "lucide-react";
import { ClienteSistema } from "@/types/admin";

interface ClienteActionsProps {
  cliente: ClienteSistema;
  isAdmin: boolean;
  onLogin: (cliente: ClienteSistema) => void;
  onBlock: (cliente: ClienteSistema) => void;
  onEdit: (cliente: ClienteSistema) => void;
  onDelete: (cliente: ClienteSistema) => void;
}

export const ClienteActions: React.FC<ClienteActionsProps> = ({
  cliente,
  isAdmin,
  onLogin,
  onBlock,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex justify-end gap-2">
      {isAdmin && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onLogin(cliente)}
        >
          <LogIn size={14} />
          Acessar
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 text-red-500 hover:text-red-700"
        onClick={() => onBlock(cliente)}
        disabled={cliente.situacao === 'bloqueado-manualmente'}
      >
        <Ban size={14} />
        Bloquear
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onEdit(cliente)}
      >
        <Pencil size={16} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onDelete(cliente)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};
