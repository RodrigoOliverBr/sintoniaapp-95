
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ClienteSistema } from "@/types/cadastro";
import { toast } from "sonner";
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditContractModalProps {
  open: boolean;
  onClose: () => void;
  cliente: ClienteSistema;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ 
  open,
  onClose,
  cliente
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState(cliente.nome || cliente.razao_social || '');
  const [email, setEmail] = useState(cliente.email || '');
  const [cpfCnpj, setCpfCnpj] = useState(cliente.cpfCnpj || cliente.cnpj || '');

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Here you'd handle the submission logic for updating the client
      const { error } = await supabase
        .from('clientes_sistema')
        .update({
          razao_social: nome,
          email: email,
          cnpj: cpfCnpj,
          // Add other fields as needed
        })
        .eq('id', cliente.id);

      if (error) {
        console.error("Error updating contract:", error);
        toast.error(handleSupabaseError(error) || "Error updating contract");
        return;
      }

      toast.success("Contract updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error((error as Error).message || "Error updating contract");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Edit Contract</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome / Razão Social</Label>
              <Input
                id="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome ou Razão Social"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                value={cpfCnpj || ''}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="CPF/CNPJ"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditContractModal;
