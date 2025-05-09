
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ClienteSistema } from "@/types/admin";
import { ClienteForm } from "@/components/admin/ClienteForm";

interface ClienteDialogsProps {
  openEditModal: boolean;
  setOpenEditModal: (open: boolean) => void;
  openDeleteModal: boolean;
  setOpenDeleteModal: (open: boolean) => void;
  openBlockModal: boolean;
  setOpenBlockModal: (open: boolean) => void;
  currentCliente: ClienteSistema | null;
  isLoading: boolean;
  onUpdateCliente: (data: any) => void;
  onDeleteCliente: () => void;
  onBlockCliente: () => void;
}

export const ClienteDialogs: React.FC<ClienteDialogsProps> = ({
  openEditModal,
  setOpenEditModal,
  openDeleteModal,
  setOpenDeleteModal,
  openBlockModal,
  setOpenBlockModal,
  currentCliente,
  isLoading,
  onUpdateCliente,
  onDeleteCliente,
  onBlockCliente,
}) => {
  if (!currentCliente) {
    return null;
  }

  const defaultValues = {
    razao_social: currentCliente.razao_social || "",
    cnpj: currentCliente.cnpj || "",
    email: currentCliente.email || "",
    telefone: currentCliente.telefone || "",
    responsavel: currentCliente.responsavel || "",
    senha: "" // Add empty senha field for edit form
  };

  return (
    <>
      {/* Edit Cliente Dialog */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere os dados do cliente e salve as mudanças.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            onSubmit={onUpdateCliente}
            defaultValues={defaultValues}
            isLoading={isLoading}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Cliente Dialog */}
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{currentCliente.razao_social}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteCliente} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Cliente Dialog */}
      <AlertDialog open={openBlockModal} onOpenChange={setOpenBlockModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja bloquear o cliente "{currentCliente.razao_social}"? Isso impedirá o acesso deles ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onBlockCliente} 
              className="bg-yellow-500 hover:bg-yellow-600"
              disabled={isLoading}
            >
              {isLoading ? "Bloqueando..." : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
