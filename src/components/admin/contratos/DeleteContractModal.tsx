
import React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteContractModalProps {
  isLoading: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteContractModal: React.FC<DeleteContractModalProps> = ({ 
  isLoading, 
  onClose, 
  onDelete 
}) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogDescription>
          Você está prestes a excluir o contrato. Tem certeza?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
          {isLoading ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteContractModal;
