
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company, Employee } from '@/types/cadastro';
import { generatePGRData } from '@/utils/relatorios/pgrDataUtils';
import { Question } from '@/types/form';
import { Badge } from '@/components/ui/badge';

export interface RelatorioPGRProps {
  company: Company;
  employee: Employee;
  questions: Question[];
  answers: Record<string, any>;
}

const RelatorioPGR: React.FC<RelatorioPGRProps> = ({ company, employee, questions, answers }) => {
  const pgrSections = generatePGRData(questions, answers);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Relatório de Programa de Gerenciamento de Riscos (PGR)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium">Dados da Empresa</h3>
          <p>Nome: {company.name}</p>
          <p>CNPJ/CPF: {company.cpfCnpj || '00.000.000/0000-00'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Dados do Funcionário</h3>
          <p>Nome: {employee.name}</p>
          <p>Email: {employee.email || 'N/A'}</p>
          <p>CPF: {employee.cpf || 'N/A'}</p>
          <p>Cargo: {employee.role || 'N/A'}</p>
          <p>Empresa: {company.name}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Avaliação de Riscos Psicossociais</h3>
          {pgrSections.map((section, idx) => (
            <div key={idx} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
              <h4 className="font-medium text-lg mb-3">{section.title}</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm text-gray-600">Descrição</p>
                  <p className="mt-1">
                    {section.description || "Riscos associados a esta categoria podem afetar a saúde e bem-estar dos colaboradores."}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Funções Expostas</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{employee.role || "Todas as funções"}</Badge>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Análise de Risco</p>
                  <div className="grid grid-cols-3 gap-4 mt-1">
                    <div>
                      <p className="text-xs text-gray-500">Probabilidade</p>
                      <p className="font-medium">
                        {section.riskAnalysis?.probability || "Média"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Severidade</p>
                      <p className="font-medium">
                        {section.riskAnalysis?.severity || "Média"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant={section.riskAnalysis?.status === "Crítico" ? "destructive" : "outline"}>
                        {section.riskAnalysis?.status || "Em análise"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Medidas de Controle</p>
                  <p className="mt-1">
                    {section.controlMeasures || "Implementar medidas preventivas e corretivas. Monitorar periodicamente."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm text-gray-600">Prazo para Implementação</p>
                    <p className="mt-1">
                      {section.implementationDeadline || "90 dias"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">Responsáveis</p>
                    <p className="mt-1">
                      {section.responsible || "Equipe de Saúde Ocupacional"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Questões Respondidas</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {section.questions.map((question) => (
                      <li key={question.id}>
                        <p className="font-medium">{question.texto}</p>
                        <p className="text-gray-600">
                          Resposta: {answers[question.id] ? 'Sim' : 'Não'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Conclusões e Recomendações</h3>
          <p className="text-gray-600">
            Com base na avaliação realizada, foram identificados fatores de risco psicossocial
            que devem ser abordados no plano de ação. Recomenda-se a implementação de medidas
            preventivas e corretivas conforme descrito nas normas regulamentadoras aplicáveis.
          </p>
        </div>

        <div className="text-right text-sm text-gray-500 mt-8">
          <p>Data de emissão: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Validade: 12 meses</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioPGR;
