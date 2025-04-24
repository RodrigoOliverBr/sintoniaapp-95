
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { addJobRole, getJobRolesByCompany } from "@/services/storageService";
import { JobRole } from "@/types/cadastro";

interface JobRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRolesUpdated?: () => void;
  preselectedCompanyId?: string;
}

const JobRolesModal: React.FC<JobRolesModalProps> = ({
  open,
  onOpenChange,
  onRolesUpdated,
  preselectedCompanyId,
}) => {
  const [newRoleName, setNewRoleName] = useState("");
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && preselectedCompanyId) {
      loadJobRoles();
    }
  }, [open, preselectedCompanyId]);

  const loadJobRoles = async () => {
    if (!preselectedCompanyId) return;

    try {
      setIsLoading(true);
      const roles = await getJobRolesByCompany(preselectedCompanyId);
      setJobRoles(roles);
    } catch (error) {
      console.error("Error loading job roles:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as funções",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Já existente, mas com pequenas melhorias de tratamento de erros
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da função não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (!preselectedCompanyId) {
      toast({
        title: "Erro",
        description: "É necessário selecionar uma empresa primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Verifica duplicidade considerando case-insensitive
      const existingRole = jobRoles.find(role => 
        role.name.toLowerCase().trim() === newRoleName.toLowerCase().trim() && 
        role.companyId === preselectedCompanyId
      );

      if (existingRole) {
        toast({
          title: "Erro",
          description: "Já existe uma função com este nome nesta empresa",
          variant: "destructive",
        });
        return;
      }

      await addJobRole(preselectedCompanyId, { 
        name: newRoleName.trim(),
        companyId: preselectedCompanyId
      });
      
      setNewRoleName("");
      toast({
        title: "Função adicionada",
        description: "A função foi adicionada com sucesso",
      });
      
      await loadJobRoles();
      if (onRolesUpdated) onRolesUpdated();
    } catch (error) {
      console.error("Erro ao adicionar job role:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar função",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    // Implementação futura
    toast({
      title: "Funcionalidade não implementada",
      description: "A exclusão de funções será implementada em uma atualização futura.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Funções</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-[1fr_auto] items-end gap-4 mb-6">
            <div>
              <Label htmlFor="new-role" className="mb-2 block">
                Nova Função
              </Label>
              <Input
                id="new-role"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nome da função"
              />
            </div>
            <Button 
              onClick={handleAddRole} 
              disabled={isLoading || !newRoleName.trim() || !preselectedCompanyId}
              type="button"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <div className="border rounded-md">
            <div className="px-4 py-3 bg-muted font-medium">
              Funções cadastradas
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-4 text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : jobRoles.length > 0 ? (
                <ul className="divide-y">
                  {jobRoles.map((role) => (
                    <li key={role.id} className="px-2 py-3 flex justify-between items-center">
                      <span>{role.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                        title="Excluir função"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex justify-center items-center p-4 text-sm text-muted-foreground">
                  {preselectedCompanyId
                    ? "Nenhuma função cadastrada ainda."
                    : "Selecione uma empresa primeiro."}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobRolesModal;
