
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Company, Employee, JobRole, Department, FormStatus } from "@/types/cadastro";
import { 
  getCompanies, 
  getEmployees, 
  getJobRoleById, 
  getDepartmentById, 
  getCompanyById, 
  deleteEmployee,
  getFormStatusByEmployeeId,
  getFormResultByEmployeeId,
  getJobRoles,
  getDepartmentsByCompany
} from "@/services/storageService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Eye, Clock, PenLine, CheckCircle2 } from "lucide-react";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para os dados
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [departmentsByCompany, setDepartmentsByCompany] = useState<Record<string, Department[]>>({});
  
  // Estado para a interface
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mapeamento das informações para renderização rápida
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Carrega dados iniciais
  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  // Carrega os nomes de departamentos e funções para todos os funcionários
  useEffect(() => {
    if (employees.length > 0 && allJobRoles.length > 0) {
      const roleMap: Record<string, string> = {};
      const deptMap: Record<string, string> = {};
      
      // Mapeia o nome de cada função pelo ID
      employees.forEach(employee => {
        const role = allJobRoles.find(r => r.id === employee.roleId);
        roleMap[employee.id] = role?.name || "N/A";
        
        // Obtém o primeiro departamento para exibição
        if (employee.departmentIds && employee.departmentIds.length > 0) {
          const deptId = employee.departmentIds[0];
          
          // Procura em todos os departamentos carregados
          const dept = allDepartments.find(d => d.id === deptId);
          deptMap[employee.id] = dept?.name || "N/A";
        } else {
          deptMap[employee.id] = "N/A";
        }
      });
      
      setRoleNames(roleMap);
      setDepartmentNames(deptMap);
    }
  }, [employees, allJobRoles, allDepartments]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carrega os cargos primeiro - isso resolve um dos erros principais
      const jobRoles = await getJobRoles();
      setAllJobRoles(jobRoles || []);
      
      // Carrega as empresas
      const loadedCompanies = await getCompanies();
      setCompanies(loadedCompanies || []);
      
      // Carrega todos os departamentos para referência
      const companyDepts: Record<string, Department[]> = {};
      const allDepts: Department[] = [];
      
      // Para cada empresa, carregamos os departamentos
      for (const company of loadedCompanies) {
        const depts = await getDepartmentsByCompany(company.id);
        companyDepts[company.id] = depts;
        allDepts.push(...depts);
      }
      
      setDepartmentsByCompany(companyDepts);
      setAllDepartments(allDepts);
      
      // Carrega os funcionários
      const allEmployees = await getEmployees();
      
      // Filtra funcionários se necessário
      if (selectedCompanyId && selectedCompanyId !== "all") {
        setEmployees((allEmployees || []).filter(e => e.companyId === selectedCompanyId));
      } else {
        setEmployees(allEmployees || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setEmployees([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cpf.includes(searchTerm)
  );

  const handleEmployeeAdded = () => {
    loadData();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await deleteEmployee(employeeToDelete.id);
        loadData();
        setIsDeleteDialogOpen(false);
        toast({
          title: "Funcionário excluído",
          description: `${employeeToDelete.name} foi removido com sucesso.`,
        });
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast({
          title: "Erro",
          description: "Falha ao excluir funcionário. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewFormResponses = (employeeId: string) => {
    navigate(`/?employeeId=${employeeId}`);
  };

  const getFormStatusDisplay = (employeeId: string) => {
    const status = getFormStatusByEmployeeId(employeeId);
    const formResult = getFormResultByEmployeeId(employeeId);
    
    // Status icon and color mapping
    const statusConfig = {
      'not-started': {
        icon: Clock,
        label: 'Não iniciado',
        color: 'bg-gray-200 text-gray-700',
        tooltipText: 'Formulário não iniciado'
      },
      'in-progress': {
        icon: PenLine,
        label: 'Em andamento',
        color: 'bg-yellow-100 text-yellow-800',
        tooltipText: 'Formulário em andamento'
      },
      'completed': {
        icon: CheckCircle2,
        label: 'Concluído',
        color: 'bg-green-100 text-green-800',
        tooltipText: 'Formulário concluído'
      }
    };

    const config = statusConfig[status];

    return (
      <div className="flex flex-col">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
                <config.icon className="h-3 w-3" />
                <span>{config.label}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.tooltipText}</p>
              {formResult?.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Última atualização: {formResult.lastUpdated ? format(new Date(formResult.lastUpdated), 'dd/MM/yyyy HH:mm') : ''}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <Button onClick={() => setIsNewEmployeeModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Select 
              value={selectedCompanyId} 
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionário"
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status do Formulário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const company = companies.find(c => c.id === employee.companyId);
                  const formStatus = getFormStatusByEmployeeId(employee.id);
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.cpf}</TableCell>
                      <TableCell>{roleNames[employee.id] || "Carregando..."}</TableCell>
                      <TableCell>{company ? company.name : "N/A"}</TableCell>
                      <TableCell>{departmentNames[employee.id] || "Carregando..."}</TableCell>
                      <TableCell>{getFormStatusDisplay(employee.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {formStatus === 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => handleViewFormResponses(employee.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Respostas</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive" 
                            onClick={() => handleDeleteClick(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum funcionário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isNewEmployeeModalOpen && (
        <NewEmployeeModal
          open={isNewEmployeeModalOpen}
          onOpenChange={setIsNewEmployeeModalOpen}
          onEmployeeAdded={handleEmployeeAdded}
          preselectedCompanyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
        />
      )}

      {isEditEmployeeModalOpen && selectedEmployee && (
        <EditEmployeeModal
          open={isEditEmployeeModalOpen}
          onOpenChange={setIsEditEmployeeModalOpen}
          onEmployeeUpdated={handleEmployeeAdded}
          employee={selectedEmployee}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário {employeeToDelete?.name}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default EmployeesPage;
