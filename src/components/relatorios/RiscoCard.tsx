
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, AlertTriangle, Flame, AlertCircle } from 'lucide-react';
import { getMitigacoesPorRisco } from '@/services/relatorios/planosMitigacaoService';

interface RiscoCardProps {
  risco: any;
  editedMedidasControle?: string;
  editedPrazo?: string;
  editedResponsavel?: string;
  editedStatus?: string;
  onMedidasChange: (value: string) => void;
  onPrazoChange: (value: string) => void;
  onResponsavelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSave: () => void;
  isEdited: boolean;
}

const RiscoCard: React.FC<RiscoCardProps> = ({
  risco,
  editedMedidasControle,
  editedPrazo,
  editedResponsavel,
  editedStatus,
  onMedidasChange,
  onPrazoChange,
  onResponsavelChange,
  onStatusChange,
  onSave,
  isEdited
}) => {
  const medidasControle = editedMedidasControle !== undefined ? editedMedidasControle : risco.medidasControle;
  const prazo = editedPrazo !== undefined ? editedPrazo : risco.prazo;
  const responsavel = editedResponsavel !== undefined ? editedResponsavel : risco.responsavel;
  const status = editedStatus !== undefined ? editedStatus : risco.status;
  
  const [mitigacoesSugeridas, setMitigacoesSugeridas] = useState<string[]>([]);

  useEffect(() => {
    const carregarMitigacoes = async () => {
      if (risco?.id) {
        const sugestoes = await getMitigacoesPorRisco(risco.id);
        setMitigacoesSugeridas(sugestoes);
      }
    };
    
    carregarMitigacoes();
  }, [risco?.id]);
  
  const getBorderColor = () => {
    if (risco.severidade === 'EXTREMAMENTE PREJUDICIAL') return 'border-l-4 border-l-red-500';
    if (risco.severidade === 'PREJUDICIAL') return 'border-l-4 border-l-orange-500';
    return 'border-l-4 border-l-green-500';
  };
  
  const getStatusBadge = () => {
    switch(status) {
      case 'Implementando':
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case 'Monitorando':
        return <Badge className="bg-green-500">Concluído</Badge>;
      case 'Pendente':
      default:
        return <Badge variant="outline">Aguardando Início</Badge>;
    }
  };
  
  const getSeverityBadge = () => {
    switch(risco.severidade) {
      case 'EXTREMAMENTE PREJUDICIAL':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium">
            <Flame size={14} />
            <span>Extremamente Prejudicial</span>
          </div>
        );
      case 'PREJUDICIAL':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs font-medium">
            <AlertTriangle size={14} />
            <span>Prejudicial</span>
          </div>
        );
      case 'LEVEMENTE PREJUDICIAL':
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
            <AlertCircle size={14} />
            <span>Levemente Prejudicial</span>
          </div>
        );
    }
  };
  
  return (
    <Card className={`overflow-hidden ${getBorderColor()}`}>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium">{risco.titulo}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground text-sm">{risco.descricao}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="font-medium text-sm text-gray-600 mb-2">Funções Expostas</p>
            <div className="flex flex-wrap gap-2">
              {risco.funcoes && risco.funcoes.length > 0 ? (
                risco.funcoes.map((funcao: string, idx: number) => (
                  <Badge key={idx} variant="outline">{funcao}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Não especificado</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium text-sm text-gray-600 mb-2">Análise de Risco</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Probabilidade</p>
                <p className="font-medium">
                  {risco.totalYes !== undefined && risco.totalQuestions !== undefined 
                    ? `${risco.totalYes}/${risco.totalQuestions}` 
                    : risco.probabilidade}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Severidade</p>
                {getSeverityBadge()}
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Select value={status} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-full h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Aguardando Início</SelectItem>
                    <SelectItem value="Implementando">Em Andamento</SelectItem>
                    <SelectItem value="Monitorando">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-4">
          <div>
            <Label htmlFor={`medidas-${risco.id}`} className="font-medium text-sm text-gray-600">
              Medidas de Controle
            </Label>
            <Textarea
              id={`medidas-${risco.id}`}
              value={medidasControle}
              onChange={(e) => onMedidasChange(e.target.value)}
              className="mt-1 resize-none"
              rows={4}
              placeholder={mitigacoesSugeridas.length > 0 ? mitigacoesSugeridas.join('\n') : "Descreva as medidas de controle para este risco..."}
            />
            {mitigacoesSugeridas.length > 0 && !medidasControle && (
              <div className="mt-2">
                <p className="text-xs text-blue-600 font-medium">Sugestões de mitigação:</p>
                <ul className="text-xs text-muted-foreground ml-4 mt-1 list-disc">
                  {mitigacoesSugeridas.map((mitigacao, idx) => (
                    <li key={idx}>{mitigacao}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor={`prazo-${risco.id}`} className="font-medium text-sm text-gray-600">
              Prazo para Implementação
            </Label>
            <Input
              id={`prazo-${risco.id}`}
              value={prazo}
              onChange={(e) => onPrazoChange(e.target.value)}
              className="mt-1"
              placeholder="30 dias"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor={`responsavel-${risco.id}`} className="font-medium text-sm text-gray-600">
              Responsáveis
            </Label>
            <Input
              id={`responsavel-${risco.id}`}
              value={responsavel}
              onChange={(e) => onResponsavelChange(e.target.value)}
              className="mt-1"
              placeholder="Recursos Humanos"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={onSave}
            disabled={!isEdited}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiscoCard;
