
import React from "react";
import { Company } from "@/types/cadastro";
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
    <div>
      <h2 className="text-base font-medium mb-2">Empresa</h2>
      {isLoadingCompanies ? (
        <Skeleton className="h-10 w-full" />
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
  );
};

export default FilterSection;
