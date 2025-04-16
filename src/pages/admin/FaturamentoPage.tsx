
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import InvoiceDashboard from "@/components/admin/faturamento/InvoiceDashboard";

const FaturamentoPage = () => {
  return (
    <AdminLayout title="Faturamento">
      <InvoiceDashboard />
    </AdminLayout>
  );
};

export default FaturamentoPage;
