
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Company, Employee, Form } from "@/types/cadastro";

interface FormSelectionSectionProps {
  companies: Company[];
  employees: Employee[];
  availableForms: Form[];
  selectedCompanyId?: string;
  selectedEmployeeId?: string;
  selectedFormId?: string;
  onCompanyChange: (companyId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onFormChange: (formId: string) => void;
  isLoadingHistory?: boolean;
}

const FormSelectionSection: React.FC<FormSelectionSectionProps> = ({
  companies,
  employees,
  availableForms,
  selectedCompanyId,
  selectedEmployeeId,
  selectedFormId,
  onCompanyChange,
  onEmployeeChange,
  onFormChange,
  isLoadingHistory = false,
}) => {
  // Auto-select first form if available
  useEffect(() => {
    if (availableForms.length > 0 && !selectedFormId) {
      onFormChange(availableForms[0].id);
    }
  }, [availableForms, selectedFormId, onFormChange]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleção de Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select 
              value={selectedCompanyId} 
              onValueChange={onCompanyChange}
            >
              <SelectTrigger id="company">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee">Funcionário</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={onEmployeeChange}
              disabled={!selectedCompanyId || employees.length === 0}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder={
                  !selectedCompanyId 
                    ? "Selecione uma empresa primeiro"
                    : employees.length === 0
                      ? "Nenhum funcionário disponível"
                      : "Selecione o funcionário"
                } />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form">Formulário</Label>
            <Select
              value={selectedFormId}
              onValueChange={onFormChange}
              disabled={!selectedEmployeeId || availableForms.length === 0}
            >
              <SelectTrigger id="form">
                <SelectValue placeholder={
                  !selectedEmployeeId 
                    ? "Selecione um funcionário primeiro"
                    : availableForms.length === 0
                      ? "Nenhum formulário disponível"
                      : "Selecione o formulário"
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
      </CardContent>
    </Card>
  );
};

export default FormSelectionSection;
