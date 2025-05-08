
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ClienteForm } from "../ClienteForm";
import { ClienteSistema } from "@/types/admin";

interface ClienteDialogsProps {
  openEditModal: boolean;
  setOpenEditModal: (open: boolean) => void;
  openDeleteModal: boolean;
  setOpenDeleteModal: (open: boolean) => void;
  openBlockModal: boolean;
  setOpenBlockModal: (open: boolean) => void;
  currentCliente: ClienteSistema | null;
  isLoading: boolean;
  onUpdateCliente: (formData: any) => Promise<void>;
  onDeleteCliente: () => Promise<void>;
  onBlockCliente: () => Promise<void>;
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
  return (
    <>
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            onSubmit={onUpdateCliente}
            initialValues={{
              razao_social: currentCliente?.razaoSocial || currentCliente?.razao_social || '',
              cnpj: currentCliente?.cnpj || '',
              email: currentCliente?.email || '',
              telefone: currentCliente?.telefone || '',
              responsavel: currentCliente?.responsavel || '',
              senha: '' // Empty for security
            }}
            isLoading={isLoading}
            isUpdate={true}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o cliente "{currentCliente?.razaoSocial || currentCliente?.razao_social}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpenDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteCliente}
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openBlockModal} onOpenChange={setOpenBlockModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar bloqueio</DialogTitle>
            <DialogDescription>
              Você está prestes a bloquear manualmente o acesso do cliente "{currentCliente?.razaoSocial || currentCliente?.razao_social}". 
              O cliente não poderá acessar o sistema após esta ação.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle size={20} className="text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Este bloqueio é manual e não será alterado automaticamente pela situação do contrato.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpenBlockModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={onBlockCliente}
                disabled={isLoading}
              >
                {isLoading ? 'Bloqueando...' : 'Bloquear Cliente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
