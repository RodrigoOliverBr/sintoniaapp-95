
import { useCompanySelection } from "./form/useCompanySelection";
import { useEmployeeSelection } from "./form/useEmployeeSelection";
import { useFormSelection } from "./form/useFormSelection";
import { useFormQuestions } from "./form/useFormQuestions";
import { useFormAnswers } from "./form/useFormAnswers";
import { useEvaluationHistory } from "./form/useEvaluationHistory";

// This file is now just a re-export to make imports cleaner
// But we're not using the hook directly anymore to avoid the invalid hook calls
export {
  useCompanySelection,
  useEmployeeSelection,
  useFormSelection,
  useFormQuestions,
  useFormAnswers,
  useEvaluationHistory
};
