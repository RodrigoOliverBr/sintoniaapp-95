
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [errorMessage, setErrorMessage] = React.useState("");

  // Clear form and error when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setName("");
      setErrorMessage("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("O nome da empresa é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Você precisa estar autenticado para adicionar uma empresa");
      }
      
      console.log("Usuário autenticado:", session.user.id);
      console.log("Iniciando processo de cadastro da empresa:", name.trim());
      
      // Enviar dados para cadastro
      await addCompany({ name: name.trim() });
      
      toast.success("Empresa cadastrada com sucesso!");
      
      setName("");
      
      // Automatically close the modal after success
      onOpenChange(false);
      
      // Refresh the companies list if callback provided
      if (onCompanyAdded) onCompanyAdded();
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      
      // Set more user-friendly error message
      if (error?.message?.includes("perfil não foi encontrado")) {
        setErrorMessage("Seu perfil não está configurado corretamente. Entre em contato com o suporte.");
      } else {
        setErrorMessage(error?.message || "Não foi possível cadastrar a empresa");
      }
      
      toast.error(error?.message || "Não foi possível cadastrar a empresa");
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
            {errorMessage && (
              <div className="text-red-500 text-sm px-4">{errorMessage}</div>
            )}
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
