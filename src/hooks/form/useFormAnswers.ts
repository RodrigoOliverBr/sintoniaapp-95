
import { useState } from "react";
import { FormResult } from "@/types/form";

export function useFormAnswers() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [formResult, setFormResult] = useState<FormResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  return {
    answers,
    setAnswers,
    formResult,
    setFormResult,
    isSubmitting,
    setIsSubmitting,
    formComplete,
    setFormComplete,
    showResults,
    setShowResults,
  };
}
