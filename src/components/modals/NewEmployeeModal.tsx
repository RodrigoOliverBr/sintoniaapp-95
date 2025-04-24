
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
import { Company, Department, JobRole } from "@/types/cadastro";
import { getJobRolesByCompany, getDepartmentsByCompany, getCompanies, addEmployee } from "@/services";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JobRolesModal from "./JobRolesModal";
import DepartmentSelect from "../employees/DepartmentSelect";
import CompanyInput from "../employees/CompanyInput";
import JobRoleSelect from "../employees/JobRoleSelect";
import { formatCPF, validateEmployeeForm } from "@/utils/employeeValidation";

interface NewEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded?: () => void;
  preselectedCompanyId?: string;
}

const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({
  open,
  onOpenChange,
  onEmployeeAdded,
  preselectedCompanyId
}) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [roleId, setRoleId] = useState("");
  const [companyId, setCompanyId] = useState(preselectedCompanyId || "");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isJobRolesModalOpen, setIsJobRolesModalOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const loadedCompanies = await getCompanies();
      setCompanies(loadedCompanies);
      
      if (preselectedCompanyId) {
        setCompanyId(preselectedCompanyId);
        loadDepartments(preselectedCompanyId);
        loadJobRoles(preselectedCompanyId);
        
        const company = loadedCompanies.find(c => c.id === preselectedCompanyId);
        setSelectedCompany(company || null);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobRoles = async (companyId: string) => {
    if (!companyId) {
      setJobRoles([]);
      setRoleId("");
      return;
    }
    try {
      const loadedJobRoles = await getJobRolesByCompany(companyId);
      setJobRoles(loadedJobRoles);
      setRoleId("");
    } catch (error) {
      console.error("Error loading job roles:", error);
      setJobRoles([]);
    }
  };

  const loadDepartments = async (companyId: string) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }
    
    try {
      const loadedDepartments = await getDepartmentsByCompany(companyId);
      setDepartments(loadedDepartments);
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    }
  };

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    const company = companies.find(c => c.id === value);
    setSelectedCompany(company || null);
    loadDepartments(value);
    loadJobRoles(value);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateEmployeeForm(name, cpf, roleId, companyId, selectedDepartments);
    if (!validation.isValid) {
      toast({
        title: "Erro",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('funcionarios')
        .insert([{
          nome: name,
          cpf,
          cargo_id: roleId,
          empresa_id: companyId
        }])
        .select()
        .single();

      if (employeeError) throw employeeError;

      const { error: deptError } = await supabase
        .from('employee_departments')
        .insert(
          selectedDepartments.map(deptId => ({
            employee_id: employeeData.id,
            department_id: deptId
          }))
        );

      if (deptError) throw deptError;
      
      toast({
        title: "Sucesso",
        description: "Funcionário cadastrado com sucesso!",
      });
      
      resetForm();
      onOpenChange(false);
      if (onEmployeeAdded) onEmployeeAdded();
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar funcionário",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setCpf("");
    setRoleId("");
    if (!preselectedCompanyId) {
      setCompanyId("");
      setSelectedCompany(null);
    }
    setSelectedDepartments([]);
  };

  const handleJobRolesUpdated = () => {
    if (companyId) {
      loadJobRoles(companyId);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário para cadastrá-lo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  className="col-span-3"
                  placeholder="000.000.000-00"
                />
              </div>
              
              <CompanyInput
                companies={companies}
                companyId={companyId}
                onCompanyChange={handleCompanyChange}
                preselectedCompanyId={preselectedCompanyId}
                selectedCompany={selectedCompany}
                isLoading={isLoading}
              />

              <DepartmentSelect
                departments={departments}
                selectedDepartments={selectedDepartments}
                onDepartmentToggle={handleDepartmentToggle}
                companyId={companyId}
              />

              <JobRoleSelect
                jobRoles={jobRoles}
                roleId={roleId}
                companyId={companyId}
                onRoleSelect={setRoleId}
                onOpenJobRolesModal={() => setIsJobRolesModalOpen(true)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Cadastrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isJobRolesModalOpen && (
        <JobRolesModal 
          open={isJobRolesModalOpen} 
          onOpenChange={setIsJobRolesModalOpen}
          onRolesUpdated={handleJobRolesUpdated}
          companyId={companyId}
        />
      )}
    </>
  );
};

export default NewEmployeeModal;
