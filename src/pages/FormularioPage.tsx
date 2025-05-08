
import React from "react";
import Layout from "@/components/Layout";
import { FormPageProvider } from "@/contexts/FormPageProvider";
import FormPageWrapper from "@/components/form/FormPageWrapper";
import { Toaster } from "sonner";

const FormularioPage: React.FC = () => {
  return (
    <Layout title="Formulário de Avaliação">
      <FormPageProvider>
        <FormPageWrapper />
      </FormPageProvider>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default FormularioPage;
