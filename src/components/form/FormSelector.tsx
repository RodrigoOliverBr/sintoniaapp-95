
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company, Employee, Form } from "@/types/cadastro";

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
  // Filter employees by company
  const filteredEmployees = selectedCompanyId
    ? employees.filter((employee) => employee.company_id === selectedCompanyId)
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Empresa</label>
        <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Funcionário</label>
        <Select
          value={selectedEmployeeId}
          onValueChange={onEmployeeChange}
          disabled={!selectedCompanyId || filteredEmployees.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={
              !selectedCompanyId
                ? "Primeiro selecione uma empresa"
                : filteredEmployees.length === 0
                ? "Nenhum funcionário cadastrado"
                : "Selecione um funcionário"
            } />
          </SelectTrigger>
          <SelectContent>
            {filteredEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Formulário</label>
        <Select
          value={selectedFormId}
          onValueChange={onFormChange}
          disabled={!selectedEmployeeId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={
              !selectedEmployeeId
                ? "Primeiro selecione um funcionário"
                : availableForms.length === 0
                ? "Nenhum formulário disponível"
                : "Selecione um formulário"
            } />
          </SelectTrigger>
          <SelectContent>
            {availableForms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FormSelector;
