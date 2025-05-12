import React, { useEffect, useState } from "react";
import { Department } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderMinus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDepartmentsByCompanyService } from "@/services";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentSelectProps {
  departments: Department[];
  selectedDepartments: string[];
  onDepartmentToggle: (departmentId: string) => void;
  companyId: string;
  onRefreshDepartments?: () => void;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  departments,
  selectedDepartments,
  onDepartmentToggle,
  companyId,
  onRefreshDepartments,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localDepartments, setLocalDepartments] = useState<Department[]>([]);
  
  // Update local departments when prop changes or component mounts
  useEffect(() => {
    console.log("DepartmentSelect: Departments updated from props:", departments);
    if (departments && departments.length > 0) {
      setLocalDepartments(departments);
    } else if (companyId) {
      // If departments prop is empty but we have companyId, try to load
      handleRefreshClick();
    }
  }, [departments, companyId]);
  
  const hasDepartments = localDepartments && localDepartments.length > 0;
  
  const handleRefreshClick = async () => {
    if (!companyId || isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("DepartmentSelect: Refresh manual de departamentos para empresa:", companyId);
      
      // Force a direct query to ensure we get fresh data
      const { data: refreshedDepartments, error } = await supabase
        .from('setores')
        .select('*')
        .eq('empresa_id', companyId);
        
      if (error) throw error;
      
      console.log("DepartmentSelect: Dados brutos do banco:", refreshedDepartments);
      
      // Map database records to Department type
      const mappedDepartments: Department[] = refreshedDepartments.map(dept => ({
        id: dept.id,
        name: dept.nome,
        companyId: dept.empresa_id
      }));
      
      console.log("DepartmentSelect: Departamentos atualizados:", mappedDepartments);
      
      // Update local state
      setLocalDepartments(mappedDepartments);
      
      // Then notify parent to update its state
      if (onRefreshDepartments) {
        onRefreshDepartments();
      }
      
      toast.success("Lista de setores atualizada com sucesso!");
    } catch (error) {
      console.error("DepartmentSelect: Erro ao atualizar departamentos:", error);
      toast.error("Erro ao atualizar lista de setores");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  console.log("DepartmentSelect: Rendering with departments:", localDepartments);

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="departments" className="text-right pt-2">
        Setores
      </Label>
      <div className="col-span-3 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {hasDepartments 
              ? `${localDepartments.length} setores disponíveis` 
              : companyId 
                ? "Nenhum setor cadastrado ainda" 
                : "Selecione uma empresa primeiro"}
          </span>
          {companyId && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleRefreshClick}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}
        </div>
        
        {hasDepartments ? (
          localDepartments.map((department) => (
            <div key={department.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${department.id}`}
                checked={selectedDepartments.includes(department.id)}
                onCheckedChange={() => onDepartmentToggle(department.id)}
              />
              <Label
                htmlFor={`dept-${department.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {department.name}
              </Label>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <FolderMinus className="mr-2 h-4 w-4" />
            {companyId 
              ? "Nenhum setor cadastrado ainda para esta empresa 😟" 
              : "Selecione uma empresa primeiro"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSelect;
