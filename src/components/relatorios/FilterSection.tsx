
import React from "react";
import { Company, Employee } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSectionProps {
  companies: Company[];
  selectedCompanyId: string;
  selectedEmployeeId: string;
  employees?: Employee[];
  onCompanyChange: (companyId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onPeriodChange: (period: string) => void;
  isGenerating: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  companies = [],
  selectedCompanyId,
  selectedEmployeeId,
  employees = [],
  onCompanyChange,
  onEmployeeChange,
  onPeriodChange,
  isGenerating
}) => {
  const isLoadingCompanies = companies.length === 0;
  const isLoadingEmployees = selectedCompanyId && employees.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company">Empresa</Label>
        {isLoadingCompanies ? (
          <Skeleton className="h-10 w-full mt-2" />
        ) : (
          <Select
            value={selectedCompanyId}
            onValueChange={onCompanyChange}
            disabled={isGenerating}
          >
            <SelectTrigger id="company" className="w-full">
              <SelectValue placeholder="Selecionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name || company.nome || "Empresa sem nome"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="employee">Funcionário (opcional)</Label>
        {isLoadingEmployees ? (
          <Skeleton className="h-10 w-full mt-2" />
        ) : (
          <Select
            value={selectedEmployeeId}
            onValueChange={onEmployeeChange}
            disabled={!selectedCompanyId || isGenerating}
          >
            <SelectTrigger id="employee" className="w-full">
              <SelectValue placeholder="Todos os funcionários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funcionários</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="period">Período</Label>
        <Select
          defaultValue="all"
          onValueChange={onPeriodChange}
          disabled={isGenerating}
        >
          <SelectTrigger id="period" className="w-full">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="1m">Último mês</SelectItem>
            <SelectItem value="3m">Últimos 3 meses</SelectItem>
            <SelectItem value="6m">Últimos 6 meses</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSection;
