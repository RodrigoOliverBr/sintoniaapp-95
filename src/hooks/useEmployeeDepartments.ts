
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmployeeDepartments = (employeeId?: string) => {
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      loadEmployeeDepartments();
    }
  }, [employeeId]);

  const loadEmployeeDepartments = async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_departments')
        .select('department_id')
        .eq('employee_id', employeeId);

      if (error) throw error;
      
      setDepartmentIds(data.map(d => d.department_id));
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployeeDepartments = async (employeeId: string, departmentIds: string[]) => {
    try {
      // Primeiro remove todas as associações existentes
      const { error: deleteError } = await supabase
        .from('employee_departments')
        .delete()
        .eq('employee_id', employeeId);

      if (deleteError) throw deleteError;

      // Então insere as novas associações
      if (departmentIds.length > 0) {
        const { error: insertError } = await supabase
          .from('employee_departments')
          .insert(
            departmentIds.map(departmentId => ({
              employee_id: employeeId,
              department_id: departmentId
            }))
          );

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar departamentos:', error);
      return { success: false, error };
    }
  };

  return {
    departmentIds,
    setDepartmentIds,
    isLoading,
    updateEmployeeDepartments
  };
};
