
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
  getEmployeeFormHistory,
  getAllForms,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities,
  getFormResults,
  deleteFormEvaluation,
  updateAnalystNotes
} from './form';
