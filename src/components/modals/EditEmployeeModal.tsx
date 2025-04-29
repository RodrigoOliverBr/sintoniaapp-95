
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Employee, JobRole, Department } from "@/types/cadastro";
import { updateEmployee, getJobRolesByCompany } from "@/services";
import { useToast } from "@/hooks/use-toast";

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  departments?: Department[];
  jobRoles?: JobRole[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  open,
  onClose,
  onSave,
  departments = [],
  jobRoles = [],
}) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [availableRoles, setAvailableRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setCpf(employee.cpf || "");
      setEmail(employee.email || "");
      setRole(employee.role || "");
      setDepartmentId(employee.department_id || "");
      
      if (employee.company_id) {
        loadJobRoles(employee.company_id);
      }
    }
  }, [employee]);
  
  const loadJobRoles = async (companyId: string) => {
    try {
      const roles = await getJobRolesByCompany(companyId);
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Error loading job roles:", error);
    }
  };

  const handleSave = async () => {
    if (!employee) return;
    
    setIsLoading(true);
    try {
      await updateEmployee(employee.id, {
        name,
        cpf,
        email,
        role,
        department_id: departmentId,
        company_id: employee.company_id
      });
      
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!",
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o funcionário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Cargo
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {(availableRoles.length > 0 ? availableRoles : jobRoles).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Setor
            </Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
