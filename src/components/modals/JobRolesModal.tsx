import React, { useState, useEffect } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { addJobRole, getJobRolesByCompany } from "@/services";
import { JobRole } from "@/types/cadastro";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRolesUpdated?: () => void;
  companyId: string;
}

const JobRolesModal: React.FC<JobRolesModalProps> = ({
  open,
  onOpenChange,
  onRolesUpdated,
  companyId,
}) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && companyId) {
      loadJobRoles();
    }
  }, [open, companyId]);

  const loadJobRoles = async () => {
    if (!companyId) return;

    try {
      setIsLoading(true);
      const roles = await getJobRolesByCompany(companyId);
      setJobRoles(roles);
    } catch (error) {
      console.error("Error loading job roles:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim() || !companyId) {
      toast({
        title: "Erro",
        description: "Nome do cargo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await addJobRole(companyId, newRoleName.trim());
      toast({
        title: "Sucesso",
        description: "Cargo adicionado com sucesso!",
      });
      setNewRoleName("");
      
      // Reload the job roles list
      await loadJobRoles();
      
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      console.error("Error adding job role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cargo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("cargos")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cargo removido com sucesso!",
      });
      
      // Reload the job roles list
      await loadJobRoles();
      
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      console.error("Error deleting job role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cargo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Cargos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="newRoleName">Nome do Cargo</Label>
              <Input
                id="newRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={isLoading || !companyId}
              />
            </div>
            <Button 
              onClick={handleAddRole}
              disabled={isLoading || !companyId || !newRoleName.trim()}
            >
              Adicionar
            </Button>
          </div>

          {jobRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {companyId ? "Nenhum cargo cadastrado" : "Selecione uma empresa para gerenciar os cargos"}
            </div>
          )}
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
