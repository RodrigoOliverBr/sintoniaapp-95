
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';

const UserAccountPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Minha Conta</h1>
      
      <Tabs defaultValue="alterar-senha" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alterar-senha">Alterar Senha</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários da Empresa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alterar-senha" className="space-y-4">
          <PasswordChangeForm />
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          <div className="rounded-md bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Usuários da Empresa</h2>
            {/* Users list will be implemented here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAccountPage;
