
import React from "react";
import Layout from "@/components/Layout";
import { FormPageProvider } from "@/contexts/FormPageProvider";
import FormPageWrapper from "@/components/form/FormPageWrapper";

const FormularioPage: React.FC = () => {
  return (
    <Layout title="Formulário de Avaliação">
      <FormPageProvider>
        <FormPageWrapper />
      </FormPageProvider>
    </Layout>
  );
};

export default FormularioPage;
