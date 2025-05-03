
import React from "react";
import { FormulariosListing } from "@/components/admin/formularios/FormulariosListing";

interface FormularioTabProps {
  onFormSelect: (formularioId: string) => void;
}

const FormularioTab: React.FC<FormularioTabProps> = ({ onFormSelect }) => {
  return <FormulariosListing onFormularioSelect={onFormSelect} />;
};

export default FormularioTab;
