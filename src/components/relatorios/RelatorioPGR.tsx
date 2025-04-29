
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Company, Employee, Form } from "@/types/cadastro";
import { Question } from "@/types/form";
import { generatePGRData } from '@/utils/relatorios/pgrDataUtils';
import { generateTableData } from '@/utils/relatorios/tableDataUtils';
import { formatDate } from '@/utils/formatDate';

interface RelatorioPGRProps {
  companyId: string;
}

// Placeholder components and data until we integrate with real API
const RelatorioPGR: React.FC<RelatorioPGRProps> = ({ companyId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Using placeholders for these objects until we fetch real data
  const mockCompany: Company = { 
    id: companyId, 
    name: 'Empresa de Exemplo', 
    cnpj: '12.345.678/0001-99',
    address: 'Endereço de Exemplo' 
  };
  
  const mockEmployee: Employee = { 
    id: '1', 
    name: 'Funcionário de Exemplo',
    department_id: '1',
    job_role_id: '1',
    email: 'exemplo@empresa.com'
  };
  
  const mockForm: Form = { 
    id: '1', 
    titulo: 'Formulário de Exemplo',
    descricao: 'Descrição do formulário',
    ativo: true
  };

  const mockQuestions: Question[] = [];
  const mockAnswers: Record<string, any> = {};

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Function to add header and footer to each page
      const addHeaderFooter = (doc: jsPDF) => {
        const headerText = 'Relatório do Programa de Gerenciamento de Riscos (PGR)';
        const footerText = 'Confidencial';
        const dateText = `Gerado em: ${formatDate(new Date())}`;

        // Header
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(headerText, pageWidth / 2, 10, {
          align: 'center',
        });

        // Footer
        doc.setFontSize(8);
        doc.text(footerText, 10, pageHeight - 10);
        doc.text(dateText, pageWidth - 10, pageHeight - 10, {
          align: 'right',
        });
      };

      // Add header and footer to the first page
      addHeaderFooter(doc);

      // Function to add a new page with header and footer
      const addNewPage = (doc: jsPDF) => {
        doc.addPage();
        addHeaderFooter(doc);
      };

      // Title
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text('Relatório do Programa de Gerenciamento de Riscos (PGR)', pageWidth / 2, 25, {
        align: 'center',
      });

      // Company and Employee Information
      doc.setFontSize(12);
      doc.text(`Empresa: ${mockCompany.name}`, 20, 40);
      doc.text(`Funcionário: ${mockEmployee.name}`, 20, 48);
      doc.text(`Formulário: ${mockForm.titulo}`, 20, 56);

      let currentY = 70;

      const pgrData = generatePGRData(mockQuestions, mockAnswers);

      // Function to render a section with a table
      const renderTable = (sectionIndex: number) => {
        const section = pgrData[sectionIndex];
        if (!section) return;

        // Section Title
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(section.title, 20, currentY);
        currentY += 8;

        const tableData = generateTableData(section.questions, mockAnswers);

        if (tableData.length === 0) {
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text('Nenhuma informação disponível para esta seção.', 20, currentY);
          currentY += 8;
          return;
        }

        autoTable(doc, {
          head: [["Questão", "Resposta", "Observação"]],
          body: tableData,
          startY: currentY,
          margin: { horizontal: 20 },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 50 },
            2: { cellWidth: 50 },
          },
          didParseCell: (data) => {
            if (data.section === 'head') {
              doc.setFontSize(12);
              doc.setTextColor(0);
            } else {
              doc.setFontSize(10);
              doc.setTextColor(50);
            }
          },
        });

        const tableHeight = (doc as any).lastAutoTable.finalY - currentY;
        currentY += tableHeight + 10;
      };

      // Render each section
      for (let i = 0; i < pgrData.length; i++) {
        if (currentY > pageHeight - 50) {
          addNewPage(doc);
          currentY = 30;
        }
        renderTable(i);
      }

      // Save the PDF
      doc.save(`Relatorio_PGR_${mockCompany.name}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={componentRef} className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isGenerating ? (
            <>Gerando PDF... </>
          ) : (
            <>
              Gerar Relatório PGR
              <Download className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RelatorioPGR;
