
import React from "react";
import { JobRole } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobRoleSelectProps {
  jobRoles: JobRole[];
  roleId: string;
  companyId: string;
  onRoleSelect: (value: string) => void;
  onOpenJobRolesModal: () => void;
}

const JobRoleSelect = ({
  jobRoles,
  roleId,
  companyId,
  onRoleSelect,
  onOpenJobRolesModal,
}: JobRoleSelectProps) => {
  const hasRoles = jobRoles.length > 0;

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="role" className="text-right">
        Função
      </Label>
      <div className="col-span-3 flex gap-2">
        <div className="flex-1">
          <Select value={roleId} onValueChange={onRoleSelect} disabled={!companyId}>
            <SelectTrigger>
              <SelectValue 
                placeholder={!companyId 
                  ? "Selecione uma empresa primeiro" 
                  : hasRoles 
                    ? "Selecione uma função..." 
                    : "Nenhuma função cadastrada"}
              />
            </SelectTrigger>
            <SelectContent>
              {jobRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={onOpenJobRolesModal}
          title="Gerenciar funções"
          disabled={!companyId}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default JobRoleSelect;
