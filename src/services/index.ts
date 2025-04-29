
// Re-export all services for easier importing
export * from './company/companyService';
export * from './department/departmentService';

// Import and re-export specific functions from employee service to avoid conflicts
import { 
  getEmployeesByCompany,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from './employee/employeeService';

export {
  getEmployeesByCompany,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
};

// Import and re-export job role functions from jobRoleService
import {
  getJobRoles,
  getJobRolesByCompany,
  getJobRoleById,
  addJobRole,
  updateJobRole,
  deleteJobRole
} from './jobRole/jobRoleService';

export {
  getJobRoles,
  getJobRolesByCompany,
  getJobRoleById,
  addJobRole,
  updateJobRole,
  deleteJobRole
};

export { 
  getFormQuestions,
  getFormResultByEmployeeId, 
  saveFormResult,
  getMitigationsByRiskId,
  getFormStatusByEmployeeId,
  getEmployeeFormHistory,
  getAllForms,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities,
  getFormResults,
  deleteFormEvaluation
} from './form';
