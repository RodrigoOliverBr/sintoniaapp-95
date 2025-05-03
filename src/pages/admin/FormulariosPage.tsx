import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormularioTab from "@/components/admin/formularios/FormularioTab";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";

const FormulariosPage: React.FC = () => {
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  return (
    <Layout title="Formulários">
      <Tabs defaultActiveKey="formularios" className="w-full">
        <TabsList>
          <TabsTrigger key="formularios" value="formularios">
            Formulários
          </TabsTrigger>
          {activeFormId && (
            <>
              <TabsTrigger key="secoes" value="secoes">
                Seções
              </TabsTrigger>
              <TabsTrigger key="perguntas" value="perguntas">
                Perguntas
              </TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="formularios">
          <FormularioTab onFormSelect={setActiveFormId} />
        </TabsContent>
        {activeFormId && (
          <>
            <TabsContent value="secoes">
              <SecoesTab formularioId={activeFormId} />
            </TabsContent>
            <TabsContent value="perguntas">
              <PerguntasTab formularioId={activeFormId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </Layout>
  );
};

export default FormulariosPage;
