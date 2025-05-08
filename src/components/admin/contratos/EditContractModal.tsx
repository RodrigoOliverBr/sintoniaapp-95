import React from "react";
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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Here you'd handle the submission logic for updating the client
      const { error } = await supabase
        .from('clientes_sistema')
        .update({
          nome: cliente.nome,
          email: cliente.email,
          cpfCnpj: cliente.cpfCnpj,
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
          <div className="py-4">
            <p>Editing contract for: {cliente.nome}</p>
            {/* 
              You would normally include the ContractForm component here
              with prefilled values from the cliente object
            */}
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
