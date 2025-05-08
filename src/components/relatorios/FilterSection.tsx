
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company, Employee } from "@/types/cadastro";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSectionProps {
  companies: Company[];
  employees: Employee[];
  selectedCompanyId: string;
  selectedEmployeeId: string;
  onCompanyChange: (companyId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onPeriodChange: (period: string) => void;
  isGenerating?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  companies,
  employees,
  selectedCompanyId,
  selectedEmployeeId,
  onCompanyChange,
  onEmployeeChange,
  onPeriodChange,
  isGenerating = false
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            {companies.length > 0 ? (
              <Select 
                value={selectedCompanyId} 
                onValueChange={onCompanyChange}
                disabled={isGenerating}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee">Funcionário</Label>
            {selectedCompanyId ? (
              <Select 
                value={selectedEmployeeId} 
                onValueChange={onEmployeeChange}
                disabled={employees.length === 0 || isGenerating}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum funcionário encontrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Select disabled>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione uma empresa primeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Selecione uma empresa primeiro
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select 
              defaultValue="all" 
              onValueChange={onPeriodChange}
              disabled={isGenerating}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="last30">Últimos 30 dias</SelectItem>
                <SelectItem value="last90">Últimos 90 dias</SelectItem>
                <SelectItem value="last180">Últimos 180 dias</SelectItem>
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
