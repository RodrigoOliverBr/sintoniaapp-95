
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  getJobRolesByCompany, 
  addJobRole 
} from "@/services/jobRole/jobRoleService"; // Import directly from jobRoleService
import { useToast } from "@/hooks/use-toast";
import { JobRole } from "@/types/cadastro";
import { Trash2 } from "lucide-react";

interface JobRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onRolesUpdated?: () => void;
}

const JobRolesModal: React.FC<JobRolesModalProps> = ({
  open,
  onOpenChange,
  companyId,
  onRolesUpdated,
}) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const loadRoles = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const loadedRoles = await getJobRolesByCompany(companyId);
      setRoles(loadedRoles);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open, companyId]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoleName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do cargo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Correcting the call to addJobRole to match parameter signature
      await addJobRole({ name: newRoleName.trim(), company_id: companyId });
      
      toast({
        title: "Sucesso",
        description: "Cargo cadastrado com sucesso!",
      });
      
      setNewRoleName("");
      loadRoles();
      if (onRolesUpdated) onRolesUpdated();
    } catch (error) {
      console.error("Erro ao adicionar cargo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cargo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gerenciar Cargos</DialogTitle>
          <DialogDescription>
            Adicione ou remova cargos desta empresa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4 overflow-auto max-h-[40vh]">
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : roles.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum cargo cadastrado</p>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <span>{role.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    // Esta função seria implementada se houvesse necessidade de remover cargos
                    // onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={handleAddRole}>
          <div className="grid grid-cols-4 items-center gap-4 mb-4">
            <Label htmlFor="roleName" className="text-right">
              Novo Cargo
            </Label>
            <div className="col-span-3 flex">
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nome do cargo"
                className="flex-1 mr-2"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobRolesModal;
