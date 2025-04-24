
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  getCompanies,
  getEmployeesByCompany,
  deleteEmployee,
  getJobRoleById
} from "@/services";
import { Company, Employee, JobRole } from "@/types/cadastro";
import { getFormStatusByEmployeeId } from "@/services";
import { useToast } from "@/hooks/use-toast";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";
import { Trash2, PenLine, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Interface for role name mapping
interface JobRoleMap {
  [key: string]: string;
}

const EmployeesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roleNames, setRoleNames] = useState<JobRoleMap>({});
  const { toast } = useToast();

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async (companyId: string) => {
    setIsLoading(true);
    try {
      const employeesData = await getEmployeesByCompany(companyId);
      setEmployees(employeesData);
      
      // Load role names for all employees
      const roleIds = employeesData
        .filter(emp => emp.roleId)
        .map(emp => emp.roleId as string);
      
      // Create a unique set of role IDs to avoid duplicate requests
      const uniqueRoleIds = [...new Set(roleIds)];
      
      // Create a map to store role names
      const newRoleNames: JobRoleMap = {};
      
      // Fetch all role names
      await Promise.all(
        uniqueRoleIds.map(async (roleId) => {
          try {
            const jobRole = await getJobRoleById(roleId);
            if (jobRole) {
              newRoleNames[roleId] = jobRole.name;
            }
          } catch (error) {
            console.error(`Error fetching role name for ${roleId}:`, error);
          }
        })
      );
      
      // Update the role names state
      setRoleNames(newRoleNames);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    } else {
      setEmployees([]);
    }
  }, [selectedCompanyId]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!",
      });
      loadEmployees(selectedCompanyId!);
    } catch (error) {
      console.error("Erro ao remover funcionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o funcionário",
        variant: "destructive",
      });
    }
  };

  const getStatusComponent = (employeeId: string) => {
    const status = getFormStatusByEmployeeId(employeeId);

    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500 h-4 w-4 inline-block mr-1" />;
      case 'pending':
        return <Clock className="text-yellow-500 h-4 w-4 inline-block mr-1" />;
      case 'error':
        return <AlertTriangle className="text-red-500 h-4 w-4 inline-block mr-1" />;
      default:
        return null;
    }
  };

  const getRoleName = (roleId: string | undefined): string => {
    if (!roleId) return 'N/A';
    return roleNames[roleId] || 'Carregando...';
  };

  const handleEmployeeUpdated = () => {
    loadEmployees(selectedCompanyId!);
  };

  return (
    <Layout title="Funcionários">
      <Card>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Lista de Funcionários</h2>
          <div className="flex space-x-2">
            <select
              className="border rounded px-2 py-1"
              onChange={handleCompanyChange}
              value={selectedCompanyId || ""}
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <Button onClick={() => setOpenNewModal(true)} disabled={!selectedCompanyId}>
              Novo Funcionário
            </Button>
          </div>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhum funcionário cadastrado</TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.cpf}</TableCell>
                    <TableCell>
                      {getRoleName(employee.roleId)}
                    </TableCell>
                    <TableCell>
                      {getStatusComponent(employee.id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setOpenEditModal(true);
                        }}
                      >
                        <PenLine className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </Card>

      <NewEmployeeModal
        open={openNewModal}
        onOpenChange={setOpenNewModal}
        preselectedCompanyId={selectedCompanyId || ""}
        onEmployeeAdded={() => loadEmployees(selectedCompanyId!)}
      />

      {selectedEmployee && (
        <EditEmployeeModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          employee={selectedEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </Layout>
  );
};

export default EmployeesPage;
