
// Export specific functions to avoid conflicts
import { getFormQuestions } from './questions';

import {
  getFormResultByEmployeeId,
  saveFormResult,
  getFormStatusByEmployeeId,
  getEmployeeFormHistory,
  updateAnalystNotes,
  deleteFormEvaluation
} from './evaluations';

import {
  getMitigationsByRiskId,
  getDefaultRiskId,
  getAllRisksWithSeverity,
  getAllSeverities
} from './risks';

import {
  getAllForms,
  getFormResults
} from './forms';

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
