import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FormResult, Question } from '@/types/form';

interface DiagnosticoIndividualProps {
  result: FormResult;
  questions: Question[];
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ result, questions }) => {

  const getQuestionText = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.texto : 'Questão não encontrada';
  };

  const getAnswerDisplay = (questionId: string) => {
    const answerData = result.answers[questionId];

    if (!answerData) {
      return 'Sem resposta';
    }

    if (answerData.answer === true) {
      return 'Sim';
    } else if (answerData.answer === false) {
      return 'Não';
    } else if (answerData.selectedOptions && answerData.selectedOptions.length > 0) {
      return answerData.selectedOptions.join(', ');
    } else if (answerData.observation) {
      return `Observação: ${answerData.observation}`;
    }

    return 'Sem resposta';
  };

  return (
    <Table>
      <TableCaption>Diagnóstico Individual</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Questão</TableHead>
          <TableHead>Resposta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map(question => (
          <TableRow key={question.id}>
            <TableCell>{getQuestionText(question.id)}</TableCell>
            <TableCell>{getAnswerDisplay(question.id)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DiagnosticoIndividual;
