
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
import { addDepartmentToCompany } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do setor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Enviando dados do setor:", { name, companyId });
      
      // Using the correct parameter structure from our service
      await addDepartmentToCompany({
        name: name.trim(),
        companyId: companyId
      });
      
      toast({
        title: "Sucesso",
        description: "Setor cadastrado com sucesso!",
      });
      
      setName("");
      onOpenChange(false);
      // Garantindo que a função de callback seja chamada após sucesso
      if (onDepartmentAdded) {
        console.log("Chamando callback onDepartmentAdded");
        setTimeout(() => {
          onDepartmentAdded();
        }, 300);
      }
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : handleSupabaseError(error);
      
      toast({
        title: "Erro",
        description: errorMessage || "Não foi possível adicionar o setor",
        variant: "destructive",
      });
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
