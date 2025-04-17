
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
import { addDepartmentToCompany } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do setor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fix: Pass an object instead of a string
      addDepartmentToCompany(companyId, { name: name });
      
      toast({
        title: "Sucesso",
        description: "Setor cadastrado com sucesso!",
      });
      
      setName("");
      onOpenChange(false);
      if (onDepartmentAdded) onDepartmentAdded();
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar setor",
        variant: "destructive",
      });
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Cadastrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDepartmentModal;
