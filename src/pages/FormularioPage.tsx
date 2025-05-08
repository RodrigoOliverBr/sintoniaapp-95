
import React from "react";
import Layout from "@/components/Layout";
import { FormPageProvider } from "@/contexts/FormPageProvider";
import FormPageWrapper from "@/components/form/FormPageWrapper";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

const FormularioPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout title="Formulário de Avaliação">
        <FormPageProvider>
          <FormPageWrapper />
        </FormPageProvider>
        <Toaster position="top-right" />
      </Layout>
    </QueryClientProvider>
  );
};

export default FormularioPage;
