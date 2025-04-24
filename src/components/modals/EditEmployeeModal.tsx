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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  getJobRolesByCompany, 
  getDepartmentsByCompany, 
  updateEmployee 
} from "@/services";
import { Employee, Department, JobRole } from "@/types/cadastro";
import { useToast } from "@/hooks/use-toast";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onEmployeeUpdated?: () => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  open,
  onOpenChange,
  employee,
  onEmployeeUpdated,
}) => {
  const [name, setName] = useState(employee?.name || "");
  const [cpf, setCpf] = useState(employee?.cpf || "");
  const [selectedRole, setSelectedRole] = useState(employee?.roleId || "");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const companyId = employee?.companyId || "";

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setCpf(employee.cpf || "");
      setSelectedRole(employee.roleId || "");
      setSelectedDepartments(employee.departmentIds || []);
    }
  }, [employee]);

  useEffect(() => {
    if (open && companyId) {
      loadJobRoles(companyId);
      loadDepartments(companyId);
    }
  }, [open, companyId]);

  const loadJobRoles = async (companyId: string) => {
    try {
      const roles = await getJobRolesByCompany(companyId);
      setJobRoles(roles);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
        variant: "destructive",
      });
    }
  };

  const loadDepartments = async (companyId: string) => {
    try {
      const depts = await getDepartmentsByCompany(companyId);
      setDepartments(depts);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os setores",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!employee?.id) {
        throw new Error("ID do funcionário não encontrado");
      }
      
      const updatedEmployeeData = {
        name: name.trim(),
        cpf: cpf.trim(),
        roleId: selectedRole,
        departmentIds: selectedDepartments,
      };
      
      await updateEmployee(employee.id, updatedEmployeeData);

      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!",
      });

      onOpenChange(false);
      if (onEmployeeUpdated) onEmployeeUpdated();
    } catch (error: any) {
      console.error("Erro ao atualizar funcionário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o funcionário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <DialogDescription>
            Altere os dados do funcionário para atualizar o cadastro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpf" className="text-right">
                CPF
              </Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Cargo
              </Label>
              <Select onValueChange={setSelectedRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o cargo" />
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-1">Setores</Label>
              <div className="col-span-3 space-y-1">
                {departments.map((department) => (
                  <div key={department.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={selectedDepartments.includes(department.id)}
                      onCheckedChange={() => toggleDepartment(department.id)}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`department-${department.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {department.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
