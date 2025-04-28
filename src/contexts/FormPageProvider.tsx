
import React from "react";
import { FormPageContext } from "./FormPageContext";
import { useFormPage } from "@/hooks/form/useFormPage";

interface FormPageProviderProps {
  children: React.ReactNode;
}

export const FormPageProvider: React.FC<FormPageProviderProps> = ({ children }) => {
  const formPageData = useFormPage();
  
  return (
    <FormPageContext.Provider value={formPageData}>
      {children}
    </FormPageContext.Provider>
  );
};
