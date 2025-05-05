
import { supabase } from "@/integrations/supabase/client";
import { Department } from "@/types/cadastro";

// Cache with expiration to avoid stale data
const departmentCache: {
  [companyId: string]: {
    departments: Department[];
    timestamp: number;
  };
} = {};

const CACHE_EXPIRATION = 30000; // 30 seconds

export const getDepartmentsByCompany = async (companyId: string): Promise<Department[]> => {
  console.log(`departmentService: Getting departments for company ${companyId}`);
  
  // Check cache
  const now = Date.now();
  const cachedData = departmentCache[companyId];
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION) {
    console.log(`departmentService: Returning ${cachedData.departments.length} departments from cache`);
    return cachedData.departments;
  }
  
  try {
    console.log(`departmentService: Cache miss or expired, querying database`);
    
    const { data, error } = await supabase
      .from("setores")
      .select("*")
      .eq("empresa_id", companyId);

    if (error) {
      console.error("departmentService: Error fetching departments:", error);
      throw error;
    }

    const departments: Department[] = data.map(dept => ({
      id: dept.id,
      name: dept.nome,
      companyId: dept.empresa_id
    }));
    
    console.log(`departmentService: Retrieved ${departments.length} departments from database`);
    
    // Update cache
    departmentCache[companyId] = {
      departments,
      timestamp: now
    };

    return departments;
  } catch (error) {
    console.error("departmentService: Unexpected error:", error);
    throw error;
  }
};

export const clearDepartmentCache = (companyId?: string) => {
  if (companyId) {
    delete departmentCache[companyId];
    console.log(`departmentService: Cleared cache for company ${companyId}`);
  } else {
    Object.keys(departmentCache).forEach(key => delete departmentCache[key]);
    console.log(`departmentService: Cleared all department cache`);
  }
};

export const addDepartment = async (
  companyId: string,
  name: string
): Promise<Department> => {
  try {
    console.log(`departmentService: Adding department "${name}" to company ${companyId}`);
    
    const { data, error } = await supabase
      .from("setores")
      .insert([{ nome: name, empresa_id: companyId }])
      .select("*")
      .single();

    if (error) {
      console.error("departmentService: Error adding department:", error);
      throw error;
    }

    const newDepartment: Department = {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    };
    
    // Clear cache for this company to force refresh
    clearDepartmentCache(companyId);
    
    console.log(`departmentService: Successfully added department:`, newDepartment);
    return newDepartment;
  } catch (error) {
    console.error("departmentService: Unexpected error adding department:", error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId: string, companyId: string): Promise<void> => {
  try {
    console.log(`departmentService: Deleting department ${departmentId} from company ${companyId}`);
    
    const { error } = await supabase
      .from("setores")
      .delete()
      .match({ id: departmentId });

    if (error) {
      console.error("departmentService: Error deleting department:", error);
      throw error;
    }

    // Clear cache for this company to force refresh
    clearDepartmentCache(companyId);
    
    console.log(`departmentService: Successfully deleted department ${departmentId}`);
  } catch (error) {
    console.error("departmentService: Unexpected error deleting department:", error);
    throw error;
  }
};
