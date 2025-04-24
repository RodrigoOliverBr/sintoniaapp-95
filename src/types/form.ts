
// Add FormAnswer interface to fix TypeScript errors
export interface FormAnswer {
  questionId: number;
  answer: boolean;
  observation?: string;
  selectedOptions?: string[];
}

// Add missing types for FormResult and SeverityLevel
export interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
}

export interface SeverityLevel {
  id: string;
  level: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  riskId: string;
  section: string;
  observationRequired?: boolean;
  options?: string[];
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface FormData {
  title: string;
  sections: FormSection[];
  severityLevels: SeverityLevel[];
}
