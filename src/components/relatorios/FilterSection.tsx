
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Company, Employee } from '@/types/cadastro';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface FilterSectionProps {
  companies: Company[];
  employees?: Employee[];
  selectedCompanyId: string;
  selectedEmployeeId: string;
  onCompanyChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  isGenerating: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  companies,
  employees = [],
  selectedCompanyId,
  selectedEmployeeId,
  onCompanyChange,
  onEmployeeChange,
  onPeriodChange,
  isGenerating
}) => {
  console.log("FilterSection rendering with:", {
    companiesCount: companies.length,
    employeesCount: employees.length,
    selectedCompanyId,
    selectedEmployeeId
  });
  
  const handleCompanyChange = (value: string) => {
    console.log("Company changed to:", value);
    onCompanyChange(value);
  };
  
  const handleEmployeeChange = (value: string) => {
    console.log("Employee changed to:", value);
    onEmployeeChange(value);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa</label>
            <Select 
              value={selectedCompanyId} 
              onValueChange={handleCompanyChange}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.length === 0 ? (
                  <SelectItem value="loading" disabled>
                    Nenhuma empresa encontrada
                  </SelectItem>
                ) : (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Funcionário</label>
            {!selectedCompanyId ? (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa primeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Selecione uma empresa primeiro</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select 
                value={selectedEmployeeId} 
                onValueChange={handleEmployeeChange}
                disabled={isGenerating || !selectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum funcionário encontrado
                    </SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select 
              defaultValue="all" 
              onValueChange={onPeriodChange}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="last-month">Último mês</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="last-year">Último ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
