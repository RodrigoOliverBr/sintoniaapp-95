
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company, Employee } from '@/types/cadastro';
import { generatePGRData } from '@/utils/relatorios/pgrDataUtils';
import { Question } from '@/types/form';

interface RelatorioPGRProps {
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
            <div key={idx} className="mb-4">
              <h4 className="font-medium mt-4">{section.title}</h4>
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
