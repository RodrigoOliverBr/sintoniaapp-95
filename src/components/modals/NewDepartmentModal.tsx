
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDepartmentToCompany, getDepartmentsByCompany } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartmentAdded?: () => void;
  companyId: string;
}

const NewDepartmentModal: React.FC<NewDepartmentModalProps> = ({
  open,
  onOpenChange,
  onDepartmentAdded,
  companyId,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast: legacyToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("O nome do setor é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("NewDepartmentModal: Enviando dados do setor:", { name, companyId });
      
      // Using the correct parameter structure from our service
      await addDepartmentToCompany({
        name: name.trim(),
        companyId: companyId
      });
      
      // Limpar o formulário e fechar o modal
      setName("");
      onOpenChange(false);
      
      // Garantindo que a função de callback seja chamada após sucesso com múltiplas tentativas
      if (onDepartmentAdded) {
        console.log("NewDepartmentModal: Chamando callback onDepartmentAdded após setor ser adicionado");
        
        // Execute callback immediately
        onDepartmentAdded();
        
        // And with progressive delays to ensure data is fully propagated
        setTimeout(() => {
          console.log("NewDepartmentModal: Chamando callback novamente após delay (500ms)");
          onDepartmentAdded();
          
          // Try one more time after 1.5 seconds just to be sure
          setTimeout(() => {
            console.log("NewDepartmentModal: Chamando callback final após delay (1.5s)");
            onDepartmentAdded();
          }, 1000);
        }, 500);
      }
      
      // Forced refresh to ensure UI is updated with the latest data
      try {
        await getDepartmentsByCompany(companyId);
      } catch (refreshErr) {
        console.error("Erro ao atualizar lista de setores:", refreshErr);
      }
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : handleSupabaseError(error);
      
      toast.error(errorMessage || "Não foi possível adicionar o setor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Setor</DialogTitle>
            <DialogDescription>
              Preencha o nome do setor para cadastrá-lo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDepartmentModal;
