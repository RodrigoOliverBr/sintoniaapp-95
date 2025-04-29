import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Plano } from "@/types/admin";
import PlanosTable from "./components/PlanosTable";
import PlanoPersistenceModal from "./components/PlanoPersistenceModal";

const PlanosPage: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentPlano, setCurrentPlano] = useState<Plano | null>(null);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase.from('planos').select('*');
      if (error) throw error;

      const transformedPlanos: Plano[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao || "",
        valorMensal: Number(item.valor_mensal),
        valorImplantacao: Number(item.valor_implantacao),
        limiteEmpresas: item.limite_empresas || 0,
        empresasIlimitadas: item.empresas_ilimitadas || false,
        limiteEmpregados: item.limite_empregados || 0,
        empregadosIlimitados: item.empregados_ilimitados || false,
        dataValidade: item.data_validade ? new Date(item.data_validade).getTime() : null,
        semVencimento: item.sem_vencimento || false,
        ativo: item.ativo || true
      }));

      setPlanos(transformedPlanos);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar os planos.');
    }
  };

  const handleAddPlano = async (novoPlanoDados: Omit<Plano, 'id'>) => {
    try {
      const newPlano = {
        nome: novoPlanoDados.nome,
        descricao: novoPlanoDados.descricao,
        valor_mensal: novoPlanoDados.valorMensal,
        valor_implantacao: novoPlanoDados.valorImplantacao,
        limite_empresas: novoPlanoDados.empresasIlimitadas ? null : novoPlanoDados.limiteEmpresas,
        empresas_ilimitadas: novoPlanoDados.empresasIlimitadas,
        limite_empregados: novoPlanoDados.empregadosIlimitados ? null : novoPlanoDados.limiteEmpregados,
        empregados_ilimitados: novoPlanoDados.empregadosIlimitados,
        data_validade: novoPlanoDados.semVencimento ? null : (novoPlanoDados.dataValidade ? new Date(novoPlanoDados.dataValidade).toISOString() : null),
        sem_vencimento: novoPlanoDados.semVencimento,
        ativo: novoPlanoDados.ativo
      };

      const { data, error } = await supabase.from('planos').insert([newPlano]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const addedPlano: Plano = {
          id: data[0].id,
          nome: data[0].nome,
          descricao: data[0].descricao || "",
          valorMensal: Number(data[0].valor_mensal),
          valorImplantacao: Number(data[0].valor_implantacao),
          limiteEmpresas: data[0].limite_empresas || 0,
          empresasIlimitadas: data[0].empresas_ilimitadas || false,
          limiteEmpregados: data[0].limite_empregados || 0,
          empregadosIlimitados: data[0].empregados_ilimitados || false,
          dataValidade: data[0].data_validade ? new Date(data[0].data_validade).getTime() : null,
          semVencimento: data[0].sem_vencimento || false,
          ativo: data[0].ativo || true
        };
        
        setPlanos(prevPlanos => [...prevPlanos, addedPlano]);
        toast.success('Plano adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar plano:', error);
      toast.error('Erro ao adicionar plano.');
    }
  };

  const handleUpdatePlano = async (planoDados: Omit<Plano, 'id'>) => {
    if (!currentPlano) return;

    try {
      const updatedPlano = {
        nome: planoDados.nome,
        descricao: planoDados.descricao,
        valor_mensal: planoDados.valorMensal,
        valor_implantacao: planoDados.valorImplantacao,
        limite_empresas: planoDados.empresasIlimitadas ? null : planoDados.limiteEmpresas,
        empresas_ilimitadas: planoDados.empresasIlimitadas,
        limite_empregados: planoDados.empregadosIlimitados ? null : planoDados.limiteEmpregados,
        empregados_ilimitados: planoDados.empregadosIlimitados,
        data_validade: planoDados.semVencimento ? null : (planoDados.dataValidade ? new Date(planoDados.dataValidade).toISOString() : null),
        sem_vencimento: planoDados.semVencimento,
        ativo: planoDados.ativo
      };

      const { error } = await supabase
        .from('planos')
        .update(updatedPlano)
        .eq('id', currentPlano.id);

      if (error) throw error;

      const updatedPlanoObj: Plano = {
        ...currentPlano,
        ...planoDados
      };
      
      setPlanos(prevPlanos => 
        prevPlanos.map(plano => plano.id === currentPlano.id ? updatedPlanoObj : plano)
      );
      
      toast.success('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano.');
    }
  };

  const handleDeletePlano = async () => {
    if (!currentPlano) return;

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', currentPlano.id);

      if (error) throw error;

      setPlanos(prevPlanos => prevPlanos.filter(plano => plano.id !== currentPlano.id));
      toast.success('Plano excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano.');
    }
  };

  const filteredPlanos = planos.filter(plano => 
    plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plano.descricao && plano.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Planos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>
                Crie e gerencie os planos oferecidos aos clientes
              </CardDescription>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setOpenNewModal(true)}
            >
              <Plus size={16} />
              Novo Plano
            </Button>
          </div>
          <div className="pt-4">
            <Input
              placeholder="Buscar plano por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xl"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlanosTable 
            planos={filteredPlanos} 
            onEdit={(plano) => {
              setCurrentPlano(plano);
              setOpenEditModal(true);
            }}
            onDelete={(plano) => {
              setCurrentPlano(plano);
              setOpenDeleteModal(true);
            }}
          />
        </CardContent>
      </Card>

      <PlanoPersistenceModal
        open={openNewModal || openEditModal}
        onOpenChange={(open) => {
          setOpenNewModal(open);
          setOpenEditModal(open);
          if (!open) setCurrentPlano(null);
        }}
        onSuccess={() => fetchPlanos()}
        planoToEdit={currentPlano}
      />

      {/* Modal de Exclusão */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o plano "{currentPlano?.nome}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeletePlano}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PlanosPage;
