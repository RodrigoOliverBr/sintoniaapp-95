
// Export specific functions to avoid conflicts
import { 
  getFormQuestions,
  getFormResultByEmployeeId,
  saveFormResult,
  getFormStatusByEmployeeId,
  getEmployeeFormHistory,
  getAllForms
} from './questions';

import {
  deleteFormEvaluation,
  updateAnalystNotes
} from './evaluations';

import {
  getMitigationsByRiskId,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities,
  getFormResults
} from './risks';

// Export individual functions to avoid naming conflicts
export {
  getFormQuestions,
  getFormResultByEmployeeId,
  saveFormResult,
  getFormStatusByEmployeeId,
  getEmployeeFormHistory,
  getAllForms,
  getMitigationsByRiskId,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities,
  getFormResults,
  deleteFormEvaluation,
  updateAnalystNotes
};
