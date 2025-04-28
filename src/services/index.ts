
// Re-export all services for easier importing
export * from './company/companyService';
export * from './department/departmentService';
export * from './employee/employeeService';
export * from './jobRole/jobRoleService';
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

