import React from "react";
import Layout from "@/components/Layout";
import DomainLookupContent from "@/components/domain/DomainLookupContent";

const DomainLookupPage: React.FC = () => (
  <Layout title="Consulta de Domínios">
    <DomainLookupContent />
  </Layout>
);

export default DomainLookupPage;
