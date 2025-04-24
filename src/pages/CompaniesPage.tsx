
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash, FolderPlus } from "lucide-react";
import { Company, Department } from "@/types/cadastro";
import { 
  deleteCompany, 
  getCompanies, 
  deleteDepartment 
} from "@/services";
import NewCompanyModal from "@/components/modals/NewCompanyModal";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NewDepartmentModal from "@/components/modals/NewDepartmentModal";
import { getClienteIdAtivo } from "@/utils/clientContext";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isNewDepartmentModalOpen, setIsNewDepartmentModalOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      // Load companies with their departments
      const loadedCompanies = await getCompanies();
      console.log("Loaded companies:", loadedCompanies);
      setCompanies(loadedCompanies || []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive"
      });
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir essa empresa? Todos os funcionários associados também serão excluídos.")) {
      try {
        await deleteCompany(id);
        await loadCompanies();
        toast({
          title: "Sucesso",
          description: "Empresa excluída com sucesso!",
        });
      } catch (error) {
        console.error("Erro ao excluir empresa:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a empresa",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteDepartment = async (companyId: string, departmentId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este setor?")) {
      try {
        // Passing just the department ID
        await deleteDepartment(departmentId);
        await loadCompanies();
        toast({
          title: "Sucesso",
          description: "Setor excluído com sucesso!",
        });
      } catch (error) {
        console.error("Erro ao excluir setor:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o setor",
          variant: "destructive"
        });
      }
    }
  };

  const openNewDepartmentModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsNewDepartmentModalOpen(true);
  };

  const handleDepartmentAdded = () => {
    loadCompanies();
  };

  return (
    <Layout title="Empresas">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
          <Button onClick={() => setIsNewCompanyModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Empresa
          </Button>
        </div>
        
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Carregando empresas...
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {companies.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhuma empresa cadastrada
                </div>
              ) : (
                companies.map((company) => (
                  <AccordionItem key={company.id} value={company.id}>
                    <div className="flex items-center justify-between px-4">
                      <AccordionTrigger className="py-4 flex-1">
                        {company.name}
                      </AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewDepartmentModal(company.id);
                          }}
                        >
                          <FolderPlus className="h-4 w-4 text-primary" />
                          <span className="ml-2">Adicionar Setor</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id);
                          }}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent>
                      <div className="pl-4 pr-4 pb-4">
                        <h3 className="text-sm font-medium mb-2">Setores</h3>
                        {company.departments && company.departments.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome do Setor</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {company.departments.map((department) => (
                                <TableRow key={department.id}>
                                  <TableCell>{department.name}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteDepartment(company.id, department.id)}
                                    >
                                      <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum setor cadastrado</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          )}
        </div>
      </div>

      <NewCompanyModal
        open={isNewCompanyModalOpen}
        onOpenChange={setIsNewCompanyModalOpen}
        onCompanyAdded={loadCompanies}
      />

      {selectedCompanyId && (
        <NewDepartmentModal
          open={isNewDepartmentModalOpen}
          onOpenChange={setIsNewDepartmentModalOpen}
          onDepartmentAdded={handleDepartmentAdded}
          companyId={selectedCompanyId}
        />
      )}
    </Layout>
  );
};

export default CompaniesPage;
