
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import FormulariosListing from "@/components/admin/formularios/FormulariosListing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerguntasTab from "@/components/admin/formularios/PerguntasTab";
import SecoesTab from "@/components/admin/formularios/SecoesTab";
import RiscosTab from "@/components/admin/formularios/RiscosTab";
import MitigacoesTab from "@/components/admin/formularios/MitigacoesTab";
import { toast } from "sonner";

export interface Secao {
  id: string;
  titulo: string;
  descricao?: string;
  formulario_id: string;
  ordem: number;
  created_at?: string;
  updated_at?: string;
}

interface FormularioDetalhado {
  id: string;
  titulo: string;
  descricao?: string;
  secoes?: Secao[];
}

const FormulariosPage: React.FC = () => {
  const [selectedFormulario, setSelectedFormulario] = useState<string | null>(null);
  const [formularioDetalhado, setFormularioDetalhado] = useState<FormularioDetalhado | null>(null);
  const [loading, setLoading] = useState(false);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [activeTab, setActiveTab] = useState("formularios");

  useEffect(() => {
    if (selectedFormulario) {
      carregarFormularioDetalhado(selectedFormulario);
    }
  }, [selectedFormulario]);

  const carregarFormularioDetalhado = async (formularioId: string) => {
    setLoading(true);
    try {
      const { data: formularioData, error: formularioError } = await supabase
        .from("formularios")
        .select("*")
        .eq("id", formularioId)
        .single();

      if (formularioError) throw formularioError;

      const { data: secoesData, error: secoesError } = await supabase
        .from("secoes")
        .select("*")
        .eq("formulario_id", formularioId)
        .order("ordem", { ascending: true });

      if (secoesError) throw secoesError;

      setSecoes(secoesData || []);
      
      setFormularioDetalhado({
        ...formularioData,
        secoes: secoesData || []
      });
      
    } catch (error) {
      console.error("Erro ao carregar formulário:", error);
      toast.error("Erro ao carregar detalhes do formulário");
    } finally {
      setLoading(false);
    }
  };

  const handleFormularioSelect = (formularioId: string) => {
    setSelectedFormulario(formularioId);
    setActiveTab("secoes");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestão de Formulários</h1>

        <Tabs defaultValue="formularios" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="formularios">Formulários</TabsTrigger>
            {selectedFormulario && (
              <>
                <TabsTrigger value="secoes">Seções</TabsTrigger>
                <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
                <TabsTrigger value="riscos">Riscos</TabsTrigger>
                <TabsTrigger value="mitigacoes">Mitigações</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="formularios">
            <FormulariosListing onFormularioSelect={handleFormularioSelect} />
          </TabsContent>

          {selectedFormulario && (
            <>
              <TabsContent value="secoes">
                <SecoesTab 
                  formularioId={selectedFormulario} 
                  secoes={secoes}
                  setSecoes={setSecoes}
                  activeTab={activeTab}
                />
              </TabsContent>

              <TabsContent value="perguntas">
                <PerguntasTab formularioId={selectedFormulario} secoes={secoes} />
              </TabsContent>

              <TabsContent value="riscos">
                <RiscosTab />
              </TabsContent>

              <TabsContent value="mitigacoes">
                <MitigacoesTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FormulariosPage;
