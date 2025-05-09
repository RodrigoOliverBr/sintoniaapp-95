
// Re-export all services for easier importing
export * from './company/companyService';
export * from './employee/employeeService';
export * from './jobRole/jobRoleService';
// Explicitly re-export department service to avoid conflict
export { 
  addDepartment,
  deleteDepartment as deleteDepartmentService,
  getDepartmentsByCompany as getDepartmentsByCompanyService
} from './department/departmentService';
export { 
  getFormQuestions,
  getFormResultByEmployeeId, 
  saveFormResult,
  getMitigationsByRiskId,
  getEmployeeFormHistory,
  getAllForms,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities,
  getFormResults,
  deleteFormEvaluation,
  updateAnalystNotes
} from './form';
