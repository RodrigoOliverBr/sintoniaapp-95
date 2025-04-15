
import React from 'react';
import { useTestClientInsertion } from '@/services/supabaseTest';

export const TestClientInsertion: React.FC = () => {
  useTestClientInsertion();
  return null; // Componente não renderiza nada visualmente
};
