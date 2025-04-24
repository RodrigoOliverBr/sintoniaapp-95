import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formSections } from "@/data/formData";
import SeverityBadge from "@/components/SeverityBadge";
import BarChart from "@/components/ui/BarChart";
import { getEmployeesByCompany, getFormResultByEmployeeId } from "@/services";
import { Employee } from "@/types/cadastro";

interface DiagnosticoIndividualProps {
  companyId: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ companyId }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formResult, setFormResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const employeesData = await getEmployeesByCompany(companyId);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      loadEmployees();
    }
  }, [companyId]);

  useEffect(() => {
    const loadFormResult = async () => {
      if (selectedEmployee) {
        setIsLoading(true);
        try {
          const result = await getFormResultByEmployeeId(selectedEmployee);
          setFormResult(result);
        } catch (error) {
          console.error("Erro ao carregar resultado do formulário:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFormResult(null);
      }
    };

    loadFormResult();
  }, [selectedEmployee]);

  const chartData = formSections.map(section => {
    const sectionResult = formResult?.respostas.find((resp: any) => resp.section === section.id);
    const severity = sectionResult ? sectionResult.severity : 0;
    return {
      name: section.title,
      value: severity
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico Individual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecione um funcionário" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : employees.length === 0 ? (
                <SelectItem value="no-employees" disabled>Nenhum funcionário cadastrado</SelectItem>
              ) : (
                employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployee && (
          <>
            {isLoading ? (
              <p>Carregando resultados...</p>
            ) : formResult ? (
              <>
                <div className="mb-4">
                  {formSections.map(section => {
                    const sectionResult = formResult.respostas.find((resp: any) => resp.section === section.id);
                    const severity = sectionResult ? sectionResult.severity : 0;

                    return (
                      <div key={section.id} className="mb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          <SeverityBadge severity={severity} />
                        </div>
                        <p className="text-sm text-gray-500">{section.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="h-[400px]">
                  <BarChart data={chartData} indexBy="name" valueKey="value" />
                </div>
              </>
            ) : (
              <p>Nenhum resultado encontrado para este funcionário.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
