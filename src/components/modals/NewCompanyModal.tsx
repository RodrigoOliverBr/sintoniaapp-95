
import React from "react";
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
import { addCompany } from "@/services"; 
import { useToast } from "@/hooks/use-toast";

interface NewCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyAdded?: () => void;
}

const NewCompanyModal: React.FC<NewCompanyModalProps> = ({
  open,
  onOpenChange,
  onCompanyAdded,
}) => {
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Iniciando processo de cadastro da empresa:", name.trim());
      
      // Simplificando ao máximo - apenas enviando o nome da empresa
      await addCompany({ name: name.trim() });
      
      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso!",
      });
      
      setName("");
      
      // Automatically close the modal after success
      onOpenChange(false);
      
      // Refresh the companies list if callback provided
      if (onCompanyAdded) onCompanyAdded();
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível cadastrar a empresa",
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
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha o nome da empresa para cadastrá-la
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-sm">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 text-sm"
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

export default NewCompanyModal;
