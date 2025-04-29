
import { useState, useCallback } from "react";
import { toast as sonnerToast } from "sonner";
import { FormResult } from "@/types/form";

export function useFormNavigation() {
  const [showResults, setShowResults] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showingHistoryView, setShowingHistoryView] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);

  const handleExitResults = useCallback(() => {
    // Navigate to the home page instead of going back to the form
    setShowResults(false);
    setFormComplete(false);
    setSelectedEvaluation(null);
    setShowForm(false);
    setShowingHistoryView(false);
  }, []);

  const handleNewEvaluation = useCallback(() => {
    console.log("handleNewEvaluation called, resetting form and showing new form");
    setShowingHistoryView(false);
    setShowForm(true);
    setSelectedEvaluation(null);
    console.log("Iniciando nova avaliação");
  }, []);

  return {
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
    showForm,
    setShowForm,
    showingHistoryView,
    setShowingHistoryView,
    selectedEvaluation,
    setSelectedEvaluation,
    handleExitResults,
    handleNewEvaluation
  };
}
