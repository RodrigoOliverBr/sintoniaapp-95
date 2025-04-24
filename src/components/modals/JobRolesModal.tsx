
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  getJobRoles, 
  getJobRolesByCompany,
  addJobRole, 
  updateJobRole,
  deleteJobRole
} from "@/services/storageService";
import { JobRole } from "@/types/cadastro";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

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
  preselectedCompanyId
}) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [editedRoleName, setEditedRoleName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<JobRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (preselectedCompanyId) {
        loadJobRolesByCompany(preselectedCompanyId);
      } else {
        loadAllJobRoles();
      }
    }
  }, [preselectedCompanyId, open]);

  const loadAllJobRoles = async () => {
    try {
      setIsLoading(true);
      const roles = await getJobRoles();
      setJobRoles(roles || []);
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      console.error("Error loading job roles:", error);
      setJobRoles([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as funções",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobRolesByCompany = async (companyId: string) => {
    try {
      setIsLoading(true);
      const roles = await getJobRolesByCompany(companyId);
      setJobRoles(roles || []);
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      console.error("Error loading job roles for company:", error);
      setJobRoles([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as funções para esta empresa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobRoles = async () => {
    if (preselectedCompanyId) {
      await loadJobRolesByCompany(preselectedCompanyId);
    } else {
      await loadAllJobRoles();
    }
  };

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

    // Check if role with same name already exists in this company
    if (jobRoles.some(role => 
      role.name.toLowerCase() === newRoleName.trim().toLowerCase() && 
      role.companyId === preselectedCompanyId
    )) {
      toast({
        title: "Erro",
        description: "Já existe uma função com este nome nesta empresa",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
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
    } catch (error) {
      console.error("Error adding job role:", error);
      if (error instanceof Error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao adicionar a função",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (role: JobRole) => {
    setEditingRole(role);
    setEditedRoleName(role.name);
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setEditedRoleName("");
  };

  const saveEditing = async () => {
    if (!editingRole) return;
    
    if (!editedRoleName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da função não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    // Check if another role with the same name exists in this company
    if (jobRoles.some(role => 
      role.id !== editingRole.id && 
      role.name.toLowerCase() === editedRoleName.trim().toLowerCase() &&
      role.companyId === editingRole.companyId
    )) {
      toast({
        title: "Erro",
        description: "Já existe uma função com este nome nesta empresa",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateJobRole(editingRole.id, {
        id: editingRole.id,
        name: editedRoleName.trim(),
        companyId: editingRole.companyId
      });
      
      toast({
        title: "Função atualizada",
        description: "A função foi atualizada com sucesso",
      });
      
      setEditingRole(null);
      setEditedRoleName("");
      await loadJobRoles();
    } catch (error) {
      console.error("Error updating job role:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a função",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (role: JobRole) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (roleToDelete) {
      try {
        setIsLoading(true);
        await deleteJobRole(roleToDelete.id);
        toast({
          title: "Função excluída",
          description: "A função foi excluída com sucesso",
        });
        setIsDeleteDialogOpen(false);
        await loadJobRoles();
      } catch (error) {
        console.error("Error deleting job role:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a função",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Only render dialog content when dialog is open to avoid issues
  if (!open) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Funções</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Nova função"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1"
              disabled={!preselectedCompanyId || isLoading}
            />
            <Button 
              onClick={handleAddRole} 
              disabled={!preselectedCompanyId || isLoading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
          
          {!preselectedCompanyId && (
            <div className="text-center py-2 text-sm text-yellow-600 mb-4">
              Selecione uma empresa para gerenciar funções
            </div>
          )}
          
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Função</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : jobRoles.length > 0 ? (
                  jobRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        {editingRole?.id === role.id ? (
                          <Input
                            value={editedRoleName}
                            onChange={(e) => setEditedRoleName(e.target.value)}
                            autoFocus
                            disabled={isLoading}
                          />
                        ) : (
                          role.name
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingRole?.id === role.id ? (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={saveEditing}
                              disabled={isLoading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={cancelEditing}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEditing(role)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => confirmDelete(role)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      {preselectedCompanyId 
                        ? "Nenhuma função cadastrada para esta empresa" 
                        : "Selecione uma empresa para ver as funções"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a função {roleToDelete?.name}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JobRolesModal;
