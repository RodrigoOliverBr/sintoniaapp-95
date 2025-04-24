
import React from "react";
import { Company } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyInputProps {
  companies: Company[];
  companyId: string;
  onCompanyChange: (value: string) => void;
  preselectedCompanyId?: string;
  selectedCompany: Company | null;
  isLoading: boolean;
}

const CompanyInput = ({
  companies,
  companyId,
  onCompanyChange,
  preselectedCompanyId,
  selectedCompany,
  isLoading,
}: CompanyInputProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="company" className="text-right">
        Empresa
      </Label>
      <div className="col-span-3">
        {preselectedCompanyId ? (
          <Input
            value={selectedCompany?.name || "Empresa selecionada"}
            readOnly
            disabled
            className="bg-muted"
          />
        ) : (
          <Select value={companyId} onValueChange={onCompanyChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione uma empresa"} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default CompanyInput;
