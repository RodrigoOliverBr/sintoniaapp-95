
import React from "react";
import { Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SectionProps {
  title: string;
  description?: string;
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
}

export const SectionAccordion: React.FC<SectionProps> = ({
  title,
  description,
  questions,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  // Sort questions by order within the section
  const sortedQuestions = [...questions].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={title} className="border-[#C8C8C9]">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          <div className="flex items-center gap-3">
            {title}
            <span className="text-sm text-muted-foreground font-normal">
              ({questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Texto</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">{question.texto}</TableCell>
                  <TableCell>{question.risco?.texto}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditQuestion(question)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDeleteQuestion(question)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
