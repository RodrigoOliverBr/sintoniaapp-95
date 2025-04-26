
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import RiscosTab from "@/components/admin/formularios/RiscosTab";
import MitigacoesTab from "@/components/admin/formularios/MitigacoesTab";
import { FormulariosListing } from "@/components/admin/formularios/FormulariosListing";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FormulariosPage = () => {
  const params = useParams();
  const formularioId = params.formularioId;
  const [formTitle, setFormTitle] = useState("");

  useEffect(() => {
    const fetchFormTitle = async () => {
      if (formularioId) {
        const { data, error } = await supabase
          .from('formularios')
          .select('titulo')
          .eq('id', formularioId)
          .single();
        
        if (data) {
          setFormTitle(data.titulo);
        }
      }
    };

    fetchFormTitle();
  }, [formularioId]);

  if (!formularioId) {
    return (
      <AdminLayout title="Gerenciamento de Formulários">
        <FormulariosListing />
      </AdminLayout>
    );
  }

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
    <AdminLayout title={`Formulário: ${formTitle}`}>
      <div className="space-y-6">
        <Tabs defaultValue="perguntas" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
            <TabsTrigger value="secoes">Seções</TabsTrigger>
            <TabsTrigger value="riscos">Riscos</TabsTrigger>
            <TabsTrigger value="mitigacoes">Ações de Mitigação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perguntas">
            <PerguntasTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="secoes">
            <SecoesTab formularioId={formularioId} />
          </TabsContent>
          
          <TabsContent value="riscos">
            <RiscosTab formularioId={formularioId} />
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
