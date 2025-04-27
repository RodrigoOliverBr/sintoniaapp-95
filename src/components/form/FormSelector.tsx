
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/types/form";
import { Company, Employee } from "@/types/cadastro";

interface FormSelectorProps {
  companies: Company[];
  employees: Employee[];
  availableForms: Form[];
  selectedCompanyId?: string;
  selectedEmployeeId?: string;
  selectedFormId: string;
  onCompanyChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onFormChange: (value: string) => void;
}

const FormSelector: React.FC<FormSelectorProps> = ({
  companies,
  employees,
  availableForms,
  selectedCompanyId,
  selectedEmployeeId,
  selectedFormId,
  onCompanyChange,
  onEmployeeChange,
  onFormChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Empresa</label>
        <Select onValueChange={onCompanyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="max-h-[200px]">
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Funcionário</label>
        <Select onValueChange={onEmployeeChange} value={selectedEmployeeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o funcionário" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="max-h-[200px]">
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Formulário</label>
        <Select onValueChange={onFormChange} value={selectedFormId} disabled={availableForms.length <= 1}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o formulário" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="max-h-[200px]">
              {availableForms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.titulo}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FormSelector;
