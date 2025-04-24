
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/ui/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDepartmentsByCompany, getEmployeesByCompany, getFormResultByEmployeeId } from "@/services";
import { Department } from "@/types/cadastro";
import { formSections } from "@/data/formData";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";

const dimensoes = [
  "Demandas Psicológicas", 
  "Organização e Gestão do Trabalho", 
  "Trabalho Ativo e Competências", 
  "Apoio Social e Liderança", 
  "Compensação e Reconhecimento", 
  "Dupla Presença", 
  "Assédio Moral e Sexual"
];

const perguntasPorDimensao = {
  "Demandas Psicológicas": [
    "Há sobrecarga de trabalho?",
    "O ritmo de trabalho é adequado?",
    "As metas são atingíveis?"
  ],
  "Organização e Gestão do Trabalho": [
    "Os processos são claros?",
    "As decisões são comunicadas adequadamente?",
    "Há participação nas decisões?"
  ],
  "Trabalho Ativo e Competências": [
    "Há autonomia no trabalho?",
    "As habilidades são bem aproveitadas?",
    "Há oportunidades de desenvolvimento?"
  ],
  "Apoio Social e Liderança": [
    "Recebe apoio dos colegas?",
    "A liderança é acessível?",
    "Há feedback construtivo?"
  ],
  "Compensação e Reconhecimento": [
    "A remuneração é adequada?",
    "Há reconhecimento pelo trabalho?",
    "Existem benefícios satisfatórios?"
  ],
  "Dupla Presença": [
    "Consegue conciliar trabalho e vida pessoal?",
    "Há flexibilidade para questões familiares?",
    "O trabalho interfere na vida pessoal?"
  ],
  "Assédio Moral e Sexual": [
    "Há respeito entre colegas?",
    "Existem políticas contra assédio?",
    "Sente-se seguro no ambiente de trabalho?"
  ]
};

const simulatedData = [
  { dimensao: "Demandas Psicológicas", percentual: 72 },
  { dimensao: "Organização e Gestão do Trabalho", percentual: 64 },
  { dimensao: "Trabalho Ativo e Competências", percentual: 45 },
  { dimensao: "Apoio Social e Liderança", percentual: 58 },
  { dimensao: "Compensação e Reconhecimento", percentual: 39 },
  { dimensao: "Dupla Presença", percentual: 51 },
  { dimensao: "Assédio Moral e Sexual", percentual: 22 }
];

const radarData = simulatedData.map(item => ({
  subject: item.dimensao.split(' ')[0], // Usa apenas a primeira palavra para o radar
  A: item.percentual,
  fullMark: 100
}));

const getRiskColor = (value: number) => {
  if (value <= 20) return "#4ade80"; // Verde para valores até 20%
  if (value <= 29) return "#facc15"; // Amarelo para valores entre 21% e 29%
  return "#f87171"; // Vermelho para valores acima de 30%
};

const getBackgroundColor = (value: number) => {
  if (value <= 20) return "bg-green-100"; // Verde claro para valores até 20%
  if (value <= 29) return "bg-yellow-100"; // Amarelo claro para valores entre 21% e 29%
  return "bg-red-100"; // Vermelho claro para valores acima de 30%
};

const getTextColor = (value: number) => {
  if (value <= 20) return "text-green-800"; // Verde escuro para valores até 20%
  if (value <= 29) return "text-yellow-800"; // Amarelo escuro para valores entre 21% e 29%
  return "text-red-800"; // Vermelho escuro para valores acima de 30%
};

interface MapaRiscoPsicossocialProps {
  companyId: string;
  departmentId: string;
  dateRange: { from?: Date; to?: Date };
}

export default function MapaRiscoPsicossocial({ 
  companyId, 
  departmentId, 
  dateRange 
}: MapaRiscoPsicossocialProps) {
  // Em uma implementação real, você usaria esses parâmetros para filtrar os dados
  
  // Dados por dimensão para o gráfico de barras
  const barData = simulatedData.map(item => ({
    dimensao: item.dimensao,
    percentual: item.percentual
  }));

  // Cores para o gráfico de barras baseado no nível de risco
  const barColors = simulatedData.map(item => getRiskColor(item.percentual));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mapa de Risco Psicossocial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Nível de Risco"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Nível de Risco"]} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Percentual de Respostas Positivas por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600 mr-4">Baixo risco (≤ 20%)</span>
              
              <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600 mr-4">Atenção (21% - 29%)</span>
              
              <span className="inline-block w-4 h-4 bg-red-500 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600">Crítico (≥ 30%)</span>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensão</TableHead>
                <TableHead className="text-center">Percentual</TableHead>
                <TableHead className="text-center">Escala Visual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.dimensao}</TableCell>
                  <TableCell className={`text-center font-bold ${getTextColor(item.percentual)}`}>
                    {item.percentual}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full`}
                          style={{ 
                            width: `${item.percentual}%`, 
                            backgroundColor: getRiskColor(item.percentual)
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>* Quanto menor o percentual de respostas positivas, maior o risco psicossocial na dimensão.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Análise por Dimensão e Setor (Mapa de Calor)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Dimensão / Pergunta</TableHead>
                  {/* This would need a proper implementation to fetch departments */}
                  {['Departamento 1', 'Departamento 2', 'Departamento 3'].map(dept => (
                    <TableHead key={dept} className="text-center">
                      {dept}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dimensoes.map((dimensao, dimIdx) => {
                  const perguntas = perguntasPorDimensao[dimensao as keyof typeof perguntasPorDimensao] || [];
                  return (
                    <React.Fragment key={dimensao}>
                      <TableRow className="bg-muted/30 font-medium">
                        <TableCell colSpan={4}>
                          {dimensao}
                        </TableCell>
                      </TableRow>
                      {perguntas.map((pergunta, qIdx) => (
                        <TableRow key={`${dimensao}-${qIdx}`}>
                          <TableCell className="pl-8 text-sm">
                            {pergunta}
                          </TableCell>
                          {['Departamento 1', 'Departamento 2', 'Departamento 3'].map(dept => {
                            const randomValue = Math.floor(Math.random() * 100);
                            return (
                              <TableCell key={dept} className="text-center">
                                <div className="flex items-center justify-center">
                                  <div 
                                    className="w-8 h-8 rounded-full mr-2" 
                                    style={{ backgroundColor: getRiskColor(randomValue) }}
                                  />
                                  <span>{randomValue}%</span>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
