
import React, { createContext, useContext } from "react";
import { FormResult, Question } from "@/types/form";
import { Company, Employee, Form } from "@/types/cadastro";

interface FormPageContextProps {
  // Company selection
  companies: Company[];
  selectedCompanyId: string | undefined;
  setSelectedCompanyId: (id: string) => void;
  
  // Employee selection
  employees: Employee[];
  selectedEmployeeId: string | undefined;
  setSelectedEmployeeId: (id: string | undefined) => void;
  
  // Form selection
  availableForms: Form[];
  selectedFormId: string;
  setSelectedFormId: (id: string) => void;
  
  // Questions and sections
  questions: Question[];
  formSections: any[];
  
  // Form state
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  formResult: FormResult | null;
  setFormResult: React.Dispatch<React.SetStateAction<FormResult | null>>;
  showResults: boolean;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  formComplete: boolean;
  setFormComplete: React.Dispatch<React.SetStateAction<boolean>>;
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  
  // History
  selectedEvaluation: FormResult | null;
  setSelectedEvaluation: React.Dispatch<React.SetStateAction<FormResult | null>>;
  evaluationHistory: FormResult[];
  isLoadingHistory: boolean;
  showingHistoryView: boolean;
  setShowingHistoryView: React.Dispatch<React.SetStateAction<boolean>>;
  loadEmployeeHistory: () => Promise<void>;
  handleDeleteEvaluation: (evaluationId: string) => Promise<void>;
  isDeletingEvaluation: boolean;
  
  // Actions
  handleCompanyChange: (value: string) => void;
  handleEmployeeChange: (value: string) => void;
  handleFormChange: (value: string) => void;
  handleNewEvaluation: () => void;
  handleExitResults: () => void;
  handleSaveAndComplete: () => Promise<void>;
  
  // Form state
  isSubmitting: boolean;
  isNewEvaluation: boolean;
  
  // Derived data
  selectedEmployee: Employee | undefined;
  selectedFormTitle: string;
}

export const FormPageContext = createContext<FormPageContextProps | undefined>(undefined);

export const useFormPageContext = () => {
  const context = useContext(FormPageContext);
  if (context === undefined) {
    throw new Error("useFormPageContext must be used within a FormPageProvider");
  }
  return context;
};
