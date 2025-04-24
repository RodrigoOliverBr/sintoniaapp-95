
import React, { useState } from "react";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySelectProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (value: string) => void;
  onNewEmployee: () => void;
}

const CompanySelect: React.FC<CompanySelectProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onNewEmployee,
}) => {
  const [open, setOpen] = useState(false);
  const selectedCompany = companies.find(company => company.id === selectedCompanyId);

  return (
    <div className="flex space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
          >
            {selectedCompany?.name ?? "Selecione uma empresa..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar empresa..." />
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    onCompanyChange(company.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button onClick={onNewEmployee} disabled={!selectedCompanyId}>
        Novo Funcionário
      </Button>
    </div>
  );
};

export default CompanySelect;
