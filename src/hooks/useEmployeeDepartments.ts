
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeDepartment {
  id: string;
  employee_id: string;
  department_id: string;
  created_at: string;
}

export const useEmployeeDepartments = () => {
  const getDepartmentsByEmployeeId = async (employeeId: string) => {
    const { data, error } = await supabase
      .from('employee_departments')
      .select('department_id')
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error fetching employee departments:', error);
      return [];
    }

    return data.map(d => d.department_id);
  };

  const updateEmployeeDepartments = async (employeeId: string, departmentIds: string[]) => {
    // Make sure departmentIds is an array
    if (!Array.isArray(departmentIds)) {
      console.error('departmentIds must be an array');
      return false;
    }
    
    // First remove all existing departments for this employee
    const { error: deleteError } = await supabase
      .from('employee_departments')
      .delete()
      .eq('employee_id', employeeId);

    if (deleteError) {
      console.error('Error deleting existing departments:', deleteError);
      return false;
    }

    // Then insert the new departments
    if (departmentIds.length > 0) {
      const departmentsToInsert = departmentIds.map(departmentId => ({
        employee_id: employeeId,
        department_id: departmentId
      }));

      const { error: insertError } = await supabase
        .from('employee_departments')
        .insert(departmentsToInsert);

      if (insertError) {
        console.error('Error inserting new departments:', insertError);
        return false;
      }
    }

    return true;
  };

  return {
    getDepartmentsByEmployeeId,
    updateEmployeeDepartments
  };
};
