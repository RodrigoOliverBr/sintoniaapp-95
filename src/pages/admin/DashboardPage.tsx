import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Users, Building, FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const DashboardPage: React.FC = () => {
  const [clientesAtivos, setClientesAtivos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [empresas, setEmpresas] = useState(0);
  const [funcionarios, setFuncionarios] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState(0);
  const [ultimasAvaliacoes, setUltimasAvaliacoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch total clients
        const { data: allClientes, error: errorAllClientes } = await supabase
          .from("clientes_sistema")
          .select("id, situacao");
        
        if (errorAllClientes) throw errorAllClientes;
        
        setTotalClientes(allClientes?.length || 0);
        console.log("Total de clientes cadastrados:", allClientes?.length || 0);
        
        // Count active clients (with situacao = 'liberado')
        const ativosCount = allClientes?.filter(cliente => cliente.situacao === 'liberado').length || 0;
        setClientesAtivos(ativosCount);
        console.log("Clientes ativos:", ativosCount);

        // Fetch companies count
        const { count: empresasCount, error: errorEmpresas } = await supabase
          .from("empresas")
          .select("id", { count: "exact", head: true });
        
        if (errorEmpresas) throw errorEmpresas;
        setEmpresas(empresasCount || 0);

        // Fetch employees count  
        const { count: funcionariosCount, error: errorFuncionarios } = await supabase
          .from("funcionarios")
          .select("id", { count: "exact", head: true });
        
        if (errorFuncionarios) throw errorFuncionarios;
        setFuncionarios(funcionariosCount || 0);

        // Fetch assessments count
        const { count: avaliacoesCount, error: errorAvaliacoes } = await supabase
          .from("avaliacoes")
          .select("id", { count: "exact", head: true });
        
        if (errorAvaliacoes) throw errorAvaliacoes;
        setAvaliacoes(avaliacoesCount || 0);

        // Fetch latest assessments
        const { data: latestAvaliacoes, error: errorLatest } = await supabase
          .from("avaliacoes")
          .select(`
            id, 
            created_at,
            empresas!inner(nome),
            funcionarios!inner(nome),
            formularios!inner(titulo)
          `)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (errorLatest) throw errorLatest;
        setUltimasAvaliacoes(latestAvaliacoes || []);
        
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Total de {totalClientes} clientes cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresas}</div>
            <p className="text-xs text-muted-foreground">
              Total de empresas cadastradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funcionarios}</div>
            <p className="text-xs text-muted-foreground">
              Total de funcionários cadastrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avaliacoes}</div>
            <p className="text-xs text-muted-foreground">
              Total de avaliações realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Últimas Avaliações</CardTitle>
          <CardDescription>
            Visualização das 5 últimas avaliações realizadas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funcionário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formulário
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ultimasAvaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(avaliacao.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {avaliacao.empresas?.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {avaliacao.funcionarios?.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {avaliacao.formularios?.titulo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default DashboardPage;
