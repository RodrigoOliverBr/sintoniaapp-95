
// Define the client status type
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente';

// This utility file contains helper functions and types related to client context
// You can add any client-related utility functions here

/**
 * Function to format client status to display text
 * @param status ClienteStatus
 * @returns Formatted status text
 */
export const formatClientStatus = (status: ClienteStatus): string => {
  switch (status) {
    case 'liberado':
      return 'Liberado';
    case 'bloqueado':
      return 'Bloqueado';
    case 'pendente':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
};

/**
 * Function to get status color based on client status
 * @param status ClienteStatus
 * @returns CSS color class
 */
export const getStatusColor = (status: ClienteStatus): string => {
  switch (status) {
    case 'liberado':
      return 'text-green-500';
    case 'bloqueado':
      return 'text-red-500';
    case 'pendente':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};
