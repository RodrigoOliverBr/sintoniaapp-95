
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import RiscosTab from "@/components/admin/formularios/RiscosTab";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";
import MitigacoesTab from "@/components/admin/formularios/MitigacoesTab";
import { FormulariosListing } from "@/components/admin/formularios/FormulariosListing";
import { useParams } from "react-router-dom";

const FormulariosPage = () => {
  const params = useParams();
  const formularioId = params.formularioId;

  if (!formularioId) {
    return (
      <AdminLayout title="Gerenciamento de Formulários">
        <FormulariosListing />
      </AdminLayout>
    );
  }

  // Se for a rota de novo formulário, podemos implementar um form de criação
  if (formularioId === "novo") {
    return (
      <AdminLayout title="Novo Formulário">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Criar Novo Formulário</h2>
          {/* Aqui virá um formulário para criação de formulários */}
          <p className="text-gray-600">Implementação do formulário de criação pendente.</p>
        </div>
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
            <RiscosTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="perguntas">
            <PerguntasTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="mitigacoes">
            <MitigacoesTab formularioId={formularioId} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FormulariosPage;
