
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Company, Employee } from "@/types/cadastro";

export interface FilterSectionProps {
  companies: Company[];
  selectedCompanyId: string;
  selectedEmployeeId: string;
  onCompanyChange: (companyId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onPeriodChange: (period: string) => void;
  isGenerating: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  companies,
  selectedCompanyId,
  selectedEmployeeId,
  onCompanyChange,
  onEmployeeChange,
  onPeriodChange,
  isGenerating
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
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
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select 
              defaultValue="all" 
              onValueChange={onPeriodChange}
              disabled={isGenerating}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="last-month">Último mês</SelectItem>
                <SelectItem value="last-quarter">Último trimestre</SelectItem>
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
