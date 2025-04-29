
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plano } from "@/types/admin";

interface DeletePlanoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planoToDelete: Plano | null;
  onConfirm: () => void;
}

const DeletePlanoModal: React.FC<DeletePlanoModalProps> = ({
  open,
  onOpenChange,
  planoToDelete,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o plano "{planoToDelete?.nome}". Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlanoModal;
