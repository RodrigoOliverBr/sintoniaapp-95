
import React from "react";
import { Company } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSectionProps {
  companies: Company[];
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  isGenerating: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  companies = [],
  selectedCompanyId,
  onCompanyChange,
  isGenerating
}) => {
  const isLoadingCompanies = companies.length === 0;

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
    </div>
  );
};

export default FilterSection;
