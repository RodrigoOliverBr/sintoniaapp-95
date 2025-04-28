
// Re-export all services for easier importing
export * from './forms';
export * from './questions';
export * from './evaluations';
export * from './risks';

// Re-export specific functions from files to maintain backward compatibility
import { getFormResultByEmployeeId, saveFormResult, getEmployeeFormHistory, deleteFormEvaluation } from './evaluations';
import { getFormResults, getFormStatusByEmployeeId } from './forms';

export {
  getFormResultByEmployeeId,
  saveFormResult,
  getEmployeeFormHistory,
  deleteFormEvaluation,
  getFormStatusByEmployeeId,
  getFormResults
};
