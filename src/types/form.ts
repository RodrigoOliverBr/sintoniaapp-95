// Add FormAnswer interface to fix TypeScript errors
export interface FormAnswer {
  questionId: number;
  answer: boolean;
  observation?: string;
  selectedOptions?: string[];
}
