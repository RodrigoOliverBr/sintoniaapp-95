
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plano } from "@/types/admin";
import { usePlanos } from "@/hooks/usePlanos";
import PlanoPersistenceModal from "./components/PlanoPersistenceModal";
import PlanosHeader from "./components/planos/PlanosHeader";
import PlanosContent from "./components/planos/PlanosContent";
import DeletePlanoModal from "./components/planos/DeletePlanoModal";

const PlanosPage: React.FC = () => {
  const { planos, fetchPlanos, deletePlano } = usePlanos();
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentPlano, setCurrentPlano] = useState<Plano | null>(null);

  const handleOpenEditModal = (plano: Plano) => {
    setCurrentPlano(plano);
    setOpenEditModal(true);
  };

  const handleOpenDeleteModal = (plano: Plano) => {
    setCurrentPlano(plano);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (currentPlano) {
      await deletePlano(currentPlano.id);
      setOpenDeleteModal(false);
      setCurrentPlano(null);
    }
  };

  const handleModalClose = () => {
    setOpenNewModal(false);
    setOpenEditModal(false);
    setCurrentPlano(null);
  };

  return (
    <AdminLayout title="Planos">
      <Card>
        <CardHeader>
          <PlanosHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewPlano={() => setOpenNewModal(true)}
          />
        </CardHeader>
        <CardContent>
          <PlanosContent 
            planos={planos}
            searchTerm={searchTerm}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        </CardContent>
      </Card>

      <PlanoPersistenceModal
        open={openNewModal || openEditModal}
        onOpenChange={handleModalClose}
        onSuccess={() => fetchPlanos()}
        planoToEdit={currentPlano}
      />

      <DeletePlanoModal
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        planoToDelete={currentPlano}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
};

export default PlanosPage;
