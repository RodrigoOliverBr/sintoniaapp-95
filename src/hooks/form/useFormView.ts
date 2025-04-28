
import { useState } from "react";

export function useFormView() {
  const [showForm, setShowForm] = useState(false);
  const [showingHistoryView, setShowingHistoryView] = useState(false);

  const viewNewEvaluation = () => {
    setShowForm(true);
    setShowingHistoryView(false);
  };

  const viewHistoryList = () => {
    setShowForm(false);
    setShowingHistoryView(true);
  };
  
  const exitFormView = () => {
    setShowForm(false);
    setShowingHistoryView(false);
  };

  return {
    showForm,
    setShowForm,
    showingHistoryView,
    setShowingHistoryView,
    viewNewEvaluation,
    viewHistoryList,
    exitFormView
  };
}
