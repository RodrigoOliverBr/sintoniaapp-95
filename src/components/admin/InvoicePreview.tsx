import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';
import { Fatura } from '@/types/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

// Register font
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 12,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  viewer: {
    width: "100%",
    height: "90vh",
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    marginBottom: 10,
  },
  tableDisplay: {
    display: "flex",
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCellHeader: {
    margin: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusBadge: {
    fontSize: 12,
  },
});

interface InvoicePreviewProps {
  invoice: Fatura;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const formatDate = (date: number): string => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusLabel = (status: Fatura['status']): string => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'pago':
        return 'Pago';
      case 'atrasado':
        return 'Atrasado';
      case 'programada':
        return 'Programada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>
              Pré-visualização da Fatura
            </Text>

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              {invoice.status === 'pendente' && (
                <Badge variant="outline">Pendente</Badge>
              )}
              {invoice.status === 'pago' && (
                <Badge variant="default">Pago</Badge>
              )}
              {invoice.status === 'atrasado' && (
                <Badge variant="destructive">Atrasado</Badge>
              )}
              {invoice.status === 'programada' && (
                <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">Programada</Badge>
              )}
            </View>

            <Text style={styles.label}>Número da Fatura:</Text>
            <Text style={styles.value}>{invoice.numero}</Text>

            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{invoice.clienteName || 'N/A'}</Text>

            <Text style={styles.label}>Data de Emissão:</Text>
            <Text style={styles.value}>{formatDate(invoice.dataEmissao)}</Text>

            <Text style={styles.label}>Data de Vencimento:</Text>
            <Text style={styles.value}>{formatDate(invoice.dataVencimento)}</Text>

            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.value}>{formatCurrency(invoice.valor)}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default InvoicePreview;
