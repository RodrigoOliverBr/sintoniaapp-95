
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ContractDialogHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle>Adicionar Novo Contrato</DialogTitle>
      <DialogDescription>
        Preencha as informações do novo contrato.
      </DialogDescription>
    </DialogHeader>
  );
};

export default ContractDialogHeader;
