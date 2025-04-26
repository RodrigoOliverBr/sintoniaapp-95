
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import RiscosTab from "@/components/admin/formularios/RiscosTab";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";
import MitigacoesTab from "@/components/admin/formularios/MitigacoesTab";
import { FormulariosListing } from "@/components/admin/formularios/FormulariosListing";
import { useParams } from "react-router-dom";

interface FormParams {
  formularioId?: string;
}

const FormulariosPage = () => {
  const { formularioId } = useParams<FormParams>();

  if (!formularioId) {
    return (
      <AdminLayout title="Gerenciamento de Formulários">
        <FormulariosListing />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gerenciamento de Formulários">
      <div className="space-y-6">
        <Tabs defaultValue="secoes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="secoes">Seções</TabsTrigger>
            <TabsTrigger value="riscos">Riscos</TabsTrigger>
            <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
            <TabsTrigger value="mitigacoes">Ações de Mitigação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="secoes">
            <SecoesTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="riscos">
            <RiscosTab />
          </TabsContent>
          
          <TabsContent value="perguntas">
            <PerguntasTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="mitigacoes">
            <MitigacoesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FormulariosPage;
