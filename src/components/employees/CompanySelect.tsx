
import React, { useState, useCallback } from "react";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySelectProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (value: string) => void;
  onNewEmployee: () => void;
}

const CompanySelect = React.memo(({ 
  companies, 
  selectedCompanyId, 
  onCompanyChange, 
  onNewEmployee 
}: CompanySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ensure we always have a valid array of companies
  const safeCompanies = Array.isArray(companies) ? companies : [];
  
  // Find the selected company safely
  const selectedCompany = safeCompanies.find(company => company.id === selectedCompanyId);
  
  // Handle company selection with proper event prevention
  const handleCompanySelect = useCallback((companyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompanyChange(companyId);
    setOpen(false);
    setSearchQuery("");
  }, [onCompanyChange]);

  // Filter companies based on search query
  const filteredCompanies = safeCompanies.filter(company => 
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecione uma empresa"
            className="w-[300px] justify-between"
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
          >
            {selectedCompany?.name ?? "Selecione uma empresa..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command
            className="w-full"
            shouldFilter={false}
          >
            <CommandInput 
              placeholder="Buscar empresa..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty className="py-2 px-2 text-sm text-muted-foreground">
              Nenhuma empresa encontrada.
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name || ""}
                    onSelect={(currentValue) => {
                      handleCompanySelect(company.id, currentValue as unknown as React.MouseEvent);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{company.name}</span>
                    </div>
                  </CommandItem>
                ))
              ) : (
                <div className="py-2 px-2 text-sm text-muted-foreground">
                  Nenhuma empresa disponível
                </div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button 
        onClick={onNewEmployee} 
        disabled={!selectedCompanyId}
        className="whitespace-nowrap"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Novo Funcionário
      </Button>
    </div>
  );
});

CompanySelect.displayName = "CompanySelect";

export default CompanySelect;
