import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, Activity, Users, Building, Calendar } from "lucide-react";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import AdminLayout from "@/components/AdminLayout";

const DashboardPage: React.FC = () => {
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="focus:outline-none">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics" className="focus:outline-none">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="focus:outline-none">Relatórios</TabsTrigger>
            <TabsTrigger value="notifications" className="focus:outline-none">Notificações</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Número total de usuários ativos no sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,234</div>
                  <div className="text-sm text-muted-foreground">+19% vs. mês passado</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Número de novos usuários cadastrados este mês.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <div className="text-sm text-muted-foreground">+12% vs. mês passado</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Número total de empresas cadastradas no sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">456</div>
                  <div className="text-sm text-muted-foreground">+5% vs. mês passado</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Novas Empresas</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Número de novas empresas cadastradas este mês.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">56</div>
                  <div className="text-sm text-muted-foreground">+3% vs. mês passado</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Visão geral das atividades recentes no sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                Gráficos e dados analíticos detalhados.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                Relatórios personalizados e exportação de dados.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                Alertas e notificações do sistema.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
