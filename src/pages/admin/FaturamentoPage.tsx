
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import InvoiceDashboard from "@/components/admin/faturamento/InvoiceDashboard";

const FaturamentoPage = () => {
  return (
    <AdminLayout title="Faturamento">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <InvoiceDashboard />
      </div>
    </AdminLayout>
  );
};

export default FaturamentoPage;
