
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ContractDialogFooterProps {
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

const ContractDialogFooter: React.FC<ContractDialogFooterProps> = ({
  onClose,
  onSave,
  isLoading,
}) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" onClick={onSave} disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </DialogFooter>
  );
};

export default ContractDialogFooter;
