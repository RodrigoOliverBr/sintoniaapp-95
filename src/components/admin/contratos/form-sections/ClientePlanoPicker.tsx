
import React from "react";
import { ClienteSistema, Plano } from "@/types/admin";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientePlanoPickerProps {
  formClienteId: string;
  setFormClienteId: (value: string) => void;
  formPlanoId: string;
  setFormPlanoId: (value: string) => void;
  clientes: ClienteSistema[];
  planos: Plano[];
  isLoading: boolean;
}

const ClientePlanoPicker: React.FC<ClientePlanoPickerProps> = ({
  formClienteId,
  setFormClienteId,
  formPlanoId,
  setFormPlanoId,
  clientes,
  planos,
  isLoading,
}) => {
  return (
    <>
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
    </>
  );
};

export default ClientePlanoPicker;
