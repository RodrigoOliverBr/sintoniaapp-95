
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import RiscosTab from "@/components/admin/formularios/RiscosTab";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";
import MitigacoesTab from "@/components/admin/formularios/MitigacoesTab";

const FormulariosPage = () => {
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
            <SecoesTab />
          </TabsContent>
          
          <TabsContent value="riscos">
            <RiscosTab />
          </TabsContent>
          
          <TabsContent value="perguntas">
            <PerguntasTab />
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
