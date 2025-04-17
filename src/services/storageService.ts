
// Current implementation - we'll extend this
import { v4 as uuidv4 } from 'uuid';
import { Company, Department, Employee, JobRole } from '@/types/cadastro';
import { getClienteIdAtivo } from '@/utils/clientContext';
import { FormStatus } from '@/types/form';

const COMPANIES_KEY = 'companies';
const EMPLOYEES_KEY = 'employees';
const JOB_ROLES_KEY = 'jobRoles';
const FORM_RESULTS_KEY = 'formResults';

// Helper to get client-specific storage key
const getClientStorageKey = (baseKey: string, clientId: string | null): string => {
  return clientId ? `${clientId}:${baseKey}` : baseKey;
};

// Company functions with client ID support
export const getCompanies = (clientId: string | null = getClienteIdAtivo()): Company[] => {
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  const companiesJSON = localStorage.getItem(key);
  try {
    return companiesJSON ? JSON.parse(companiesJSON) : [];
  } catch (error) {
    console.error('Error parsing companies:', error);
    return [];
  }
};

export const getCompanyById = (companyId: string, clientId: string | null = getClienteIdAtivo()): Company | null => {
  const companies = getCompanies(clientId);
  return companies.find(c => c.id === companyId) || null;
};

export const addCompany = (companyData: Partial<Company>, clientId: string | null = getClienteIdAtivo()): Company => {
  const companies = getCompanies(clientId);
  const newCompany: Company = {
    id: uuidv4(),
    name: companyData.name || 'Nova Empresa',
    departments: [],
    ...companyData,
    clienteId: clientId || undefined,
  };
  
  companies.push(newCompany);
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(companies));
  return newCompany;
};

export const updateCompany = (companyId: string, companyData: Partial<Company>, clientId: string | null = getClienteIdAtivo()): Company | null => {
  const companies = getCompanies(clientId);
  const index = companies.findIndex(c => c.id === companyId);
  
  if (index === -1) return null;
  
  const updatedCompany = {
    ...companies[index],
    ...companyData,
  };
  
  companies[index] = updatedCompany;
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(companies));
  return updatedCompany;
};

export const deleteCompany = (companyId: string, clientId: string | null = getClienteIdAtivo()): boolean => {
  const companies = getCompanies(clientId);
  const filteredCompanies = companies.filter(c => c.id !== companyId);
  
  if (filteredCompanies.length === companies.length) return false;
  
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(filteredCompanies));
  
  // Also delete associated employees
  const employees = getEmployees(clientId);
  const remainingEmployees = employees.filter(e => e.companyId !== companyId);
  const employeesKey = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(employeesKey, JSON.stringify(remainingEmployees));
  
  return true;
};

// Department functions
export const addDepartmentToCompany = (companyId: string, departmentData: Partial<Department>, clientId: string | null = getClienteIdAtivo()): Department | null => {
  const companies = getCompanies(clientId);
  const companyIndex = companies.findIndex(c => c.id === companyId);
  
  if (companyIndex === -1) return null;
  
  const newDepartment: Department = {
    id: uuidv4(),
    name: departmentData.name || 'Novo Setor',
    companyId,
    ...departmentData,
  };
  
  companies[companyIndex].departments.push(newDepartment);
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(companies));
  return newDepartment;
};

export const getDepartmentById = (departmentId: string, clientId: string | null = getClienteIdAtivo()): Department | null => {
  const companies = getCompanies(clientId);
  for (const company of companies) {
    const department = company.departments.find(d => d.id === departmentId);
    if (department) return department;
  }
  return null;
};

export const getDepartmentsByCompany = (companyId: string, clientId: string | null = getClienteIdAtivo()): Department[] => {
  const company = getCompanyById(companyId, clientId);
  return company ? company.departments : [];
};

export const deleteDepartment = (companyId: string, departmentId: string, clientId: string | null = getClienteIdAtivo()): boolean => {
  const companies = getCompanies(clientId);
  const companyIndex = companies.findIndex(c => c.id === companyId);
  
  if (companyIndex === -1) return false;
  
  const departments = companies[companyIndex].departments;
  const filteredDepartments = departments.filter(d => d.id !== departmentId);
  
  if (filteredDepartments.length === departments.length) return false;
  
  companies[companyIndex].departments = filteredDepartments;
  const key = getClientStorageKey(COMPANIES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(companies));
  
  // Also update employees to remove this department
  const employees = getEmployees(clientId);
  const updatedEmployees = employees.map(employee => {
    if (employee.departmentId === departmentId) {
      return { ...employee, departmentId: '' };
    }
    return employee;
  });
  
  const employeesKey = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(employeesKey, JSON.stringify(updatedEmployees));
  
  return true;
};

// Job roles functions with client ID support
export const getJobRoles = (clientId: string | null = getClienteIdAtivo()): JobRole[] => {
  const key = getClientStorageKey(JOB_ROLES_KEY, clientId);
  const rolesJSON = localStorage.getItem(key);
  try {
    return rolesJSON ? JSON.parse(rolesJSON) : [];
  } catch (error) {
    console.error('Error parsing job roles:', error);
    return [];
  }
};

export const getJobRoleById = (roleId: string, clientId: string | null = getClienteIdAtivo()): JobRole | null => {
  const roles = getJobRoles(clientId);
  return roles.find(r => r.id === roleId) || null;
};

export const getJobRolesByCompany = (companyId: string, clientId: string | null = getClienteIdAtivo()): JobRole[] => {
  const roles = getJobRoles(clientId);
  return roles.filter(r => r.companyId === companyId);
};

export const addJobRole = (roleData: Partial<JobRole>, clientId: string | null = getClienteIdAtivo()): JobRole => {
  const roles = getJobRoles(clientId);
  const newRole: JobRole = {
    id: uuidv4(),
    name: roleData.name || 'Nova Função',
    companyId: roleData.companyId || '',
  };
  
  roles.push(newRole);
  const key = getClientStorageKey(JOB_ROLES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(roles));
  return newRole;
};

export const updateJobRole = (roleId: string, roleData: Partial<JobRole>, clientId: string | null = getClienteIdAtivo()): JobRole | null => {
  const roles = getJobRoles(clientId);
  const index = roles.findIndex(r => r.id === roleId);
  
  if (index === -1) return null;
  
  const updatedRole = {
    ...roles[index],
    ...roleData,
  };
  
  roles[index] = updatedRole;
  const key = getClientStorageKey(JOB_ROLES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(roles));
  return updatedRole;
};

export const deleteJobRole = (roleId: string, clientId: string | null = getClienteIdAtivo()): boolean => {
  const roles = getJobRoles(clientId);
  const filteredRoles = roles.filter(r => r.id !== roleId);
  
  if (filteredRoles.length === roles.length) return false;
  
  const key = getClientStorageKey(JOB_ROLES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(filteredRoles));
  
  // Update employees to remove this role
  const employees = getEmployees(clientId);
  const updatedEmployees = employees.map(employee => {
    if (employee.roleId === roleId) {
      return { ...employee, roleId: '' };
    }
    return employee;
  });
  
  const employeesKey = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(employeesKey, JSON.stringify(updatedEmployees));
  
  return true;
};

// Employee functions with client ID support
export const getEmployees = (clientId: string | null = getClienteIdAtivo()): Employee[] => {
  const key = getClientStorageKey(EMPLOYEES_KEY, clientId);
  const employeesJSON = localStorage.getItem(key);
  try {
    return employeesJSON ? JSON.parse(employeesJSON) : [];
  } catch (error) {
    console.error('Error parsing employees:', error);
    return [];
  }
};

export const getEmployeesByCompany = (companyId: string, clientId: string | null = getClienteIdAtivo()): Employee[] => {
  return getEmployeesByCompanyId(companyId, clientId);
};

export const addEmployee = (employeeData: Partial<Employee>, clientId: string | null = getClienteIdAtivo()): Employee => {
  const employees = getEmployees(clientId);
  const newEmployee: Employee = {
    id: uuidv4(),
    name: employeeData.name || '',
    cpf: employeeData.cpf || '',
    roleId: employeeData.roleId || '',
    departmentId: employeeData.departmentId || '',
    companyId: employeeData.companyId || '',
  };
  
  employees.push(newEmployee);
  const key = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(employees));
  return newEmployee;
};

export const updateEmployee = (employeeId: string, employeeData: Partial<Employee>, clientId: string | null = getClienteIdAtivo()): Employee | null => {
  const employees = getEmployees(clientId);
  const index = employees.findIndex(e => e.id === employeeId);
  
  if (index === -1) return null;
  
  const updatedEmployee = {
    ...employees[index],
    ...employeeData,
  };
  
  employees[index] = updatedEmployee;
  const key = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(employees));
  return updatedEmployee;
};

export const deleteEmployee = (employeeId: string, clientId: string | null = getClienteIdAtivo()): boolean => {
  const employees = getEmployees(clientId);
  const filteredEmployees = employees.filter(e => e.id !== employeeId);
  
  if (filteredEmployees.length === employees.length) return false;
  
  const key = getClientStorageKey(EMPLOYEES_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(filteredEmployees));
  return true;
};

// Helper to find an employee by ID
export const getEmployeeById = (employeeId: string, clientId: string | null = getClienteIdAtivo()): Employee | null => {
  const employees = getEmployees(clientId);
  return employees.find(e => e.id === employeeId) || null;
};

// Helper to get employees by company ID
export const getEmployeesByCompanyId = (companyId: string, clientId: string | null = getClienteIdAtivo()): Employee[] => {
  const employees = getEmployees(clientId);
  return employees.filter(e => e.companyId === companyId);
};

// Form results related functions
interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
}

export const getFormResults = (clientId: string | null = getClienteIdAtivo()): FormResult[] => {
  const key = getClientStorageKey(FORM_RESULTS_KEY, clientId);
  const resultsJSON = localStorage.getItem(key);
  try {
    return resultsJSON ? JSON.parse(resultsJSON) : [];
  } catch (error) {
    console.error('Error parsing form results:', error);
    return [];
  }
};

export const getFormResultByEmployeeId = (employeeId: string, clientId: string | null = getClienteIdAtivo()): FormResult | null => {
  const results = getFormResults(clientId);
  return results.find(r => r.employeeId === employeeId) || null;
};

export const saveFormResult = (employeeId: string, data: any, clientId: string | null = getClienteIdAtivo()): FormResult => {
  const results = getFormResults(clientId);
  const existingIndex = results.findIndex(r => r.employeeId === employeeId);
  
  const formResult: FormResult = {
    employeeId,
    data,
    lastUpdated: Date.now()
  };
  
  if (existingIndex >= 0) {
    results[existingIndex] = formResult;
  } else {
    results.push(formResult);
  }
  
  const key = getClientStorageKey(FORM_RESULTS_KEY, clientId);
  localStorage.setItem(key, JSON.stringify(results));
  return formResult;
};

export const getFormStatusByEmployeeId = (employeeId: string, clientId: string | null = getClienteIdAtivo()): FormStatus => {
  const result = getFormResultByEmployeeId(employeeId, clientId);
  
  if (!result) return 'not-started';
  
  // Logic to determine if form is complete or in progress
  // This is a simplified example - adjust based on your actual form completion criteria
  const isComplete = result.data && result.data.completed === true;
  return isComplete ? 'completed' : 'in-progress';
};
