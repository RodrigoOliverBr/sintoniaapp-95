
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCompanies, getJobRoles, updateEmployee } from "@/services/storageService";
import { Company, Department, Employee, JobRole } from "@/types/cadastro";
import { z } from "zod";
import { Plus, FolderX } from "lucide-react";
import JobRolesModal from "./JobRolesModal";
import { useEmployeeDepartments } from "@/hooks/useEmployeeDepartments";
import { Checkbox } from "@/components/ui/checkbox";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated?: () => void;
  employee: Employee;
}

const employeeSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF deve ter no máximo 14 caracteres"),
  roleId: z.string().min(1, "Selecione uma função"),
  companyId: z.string().min(1, "Selecione uma empresa"),
  departmentId: z.string().min(1, "Selecione um setor"),
});

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  open,
  onOpenChange,
  onEmployeeUpdated,
  employee
}) => {
  const [name, setName] = useState(employee.name);
  const [cpf, setCpf] = useState(employee.cpf);
  const [roleId, setRoleId] = useState(employee.roleId);
  const [companyId, setCompanyId] = useState(employee.companyId);
  const [departmentId, setDepartmentId] = useState(employee.departmentId);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isJobRolesModalOpen, setIsJobRolesModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { getDepartmentsByEmployeeId, updateEmployeeDepartments } = useEmployeeDepartments();

  useEffect(() => {
    // Ensure we're getting valid arrays or defaulting to empty arrays
    const loadedCompanies = getCompanies() || [];
    setCompanies(loadedCompanies);
    
    loadJobRoles();
    loadDepartments(companyId);
    
    // Load existing departments for this employee
    const loadEmployeeDepartments = async () => {
      const departmentIds = await getDepartmentsByEmployeeId(employee.id);
      setSelectedDepartmentIds(departmentIds);
    };
    
    loadEmployeeDepartments();
  }, [companyId, employee.id]);

  const loadJobRoles = () => {
    const loadedJobRoles = getJobRoles() || [];
    setJobRoles(loadedJobRoles);
  };

  const loadDepartments = (companyId: string) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }
    
    const company = companies.find(c => c.id === companyId);
    if (company && company.departments) {
      setDepartments(company.departments);
    } else {
      setDepartments([]);
    }
  };

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setDepartmentId("");
    setSelectedDepartmentIds([]);
  };

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartmentIds(current => {
      if (current.includes(departmentId)) {
        return current.filter(id => id !== departmentId);
      } else {
        return [...current, departmentId];
      }
    });
    
    // If this is the first department being selected, also update the main departmentId
    if (selectedDepartmentIds.length === 0) {
      setDepartmentId(departmentId);
    }
  };

  const validateForm = () => {
    try {
      employeeSchema.parse({
        name,
        cpf,
        roleId,
        companyId,
        departmentId: selectedDepartmentIds.length > 0 ? selectedDepartmentIds[0] : ""
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDepartmentIds.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um setor",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    const updatedEmployee: Employee = {
      id: employee.id,
      name,
      cpf,
      roleId,
      companyId,
      departmentId: selectedDepartmentIds[0] // Use first department as primary
    };
    
    updateEmployee(updatedEmployee);
    
    // Update employee-department relationships
    await updateEmployeeDepartments(employee.id, selectedDepartmentIds);
    
    toast({
      title: "Funcionário atualizado",
      description: "As informações do funcionário foram atualizadas com sucesso.",
    });
    
    onOpenChange(false);
    if (onEmployeeUpdated) onEmployeeUpdated();
  };

  // Only render dialog content when dialog is open to avoid command component issues
  if (!open) {
    return null;
  }

  const hasDepartments = departments.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="company">Empresa</Label>
              <Select value={companyId} onValueChange={handleCompanyChange}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && <p className="text-sm text-destructive">{errors.companyId}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="departments">Setores</Label>
              <div>
                {!companyId ? (
                  <div className="text-sm text-muted-foreground">Selecione uma empresa primeiro</div>
                ) : !hasDepartments ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FolderX className="mr-2 h-4 w-4" />
                    Nenhum setor cadastrado ainda
                  </div>
                ) : (
                  <div className="space-y-2 border rounded-md p-2">
                    {departments.map((department) => (
                      <div key={department.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`dept-edit-${department.id}`}
                          checked={selectedDepartmentIds.includes(department.id)}
                          onCheckedChange={() => toggleDepartment(department.id)}
                        />
                        <label 
                          htmlFor={`dept-edit-${department.id}`} 
                          className="text-sm cursor-pointer"
                        >
                          {department.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsJobRolesModalOpen(true)}
                  title="Gerenciar funções"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.roleId && <p className="text-sm text-destructive">{errors.roleId}</p>}
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isJobRolesModalOpen && (
        <JobRolesModal 
          open={isJobRolesModalOpen} 
          onOpenChange={setIsJobRolesModalOpen}
          onRolesUpdated={loadJobRoles}
        />
      )}
    </>
  );
};

export default EditEmployeeModal;
