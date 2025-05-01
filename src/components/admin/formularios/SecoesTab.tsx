
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Section } from '@/types/form';

interface SecoesTabProps {
  formularioId: string | null;
  secoes: Section[];
  setSecoes: React.Dispatch<React.SetStateAction<Section[]>>;
  onOpen?: (id: string) => void;
  activeTab: string;
  refreshPerguntas?: () => void;
}

const SecoesTab: React.FC<SecoesTabProps> = ({ 
  formularioId, 
  secoes, 
  setSecoes, 
  onOpen = () => {}, 
  activeTab,
  refreshPerguntas 
}) => {
  const [novaSecao, setNovaSecao] = useState({ 
    id: '', 
    titulo: '', 
    descricao: '', 
    ordem: 1
  });
  const [editingSecao, setEditingSecao] = useState<Section | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Estado para a nova pergunta
  const [novaPergunta, setNovaPergunta] = useState({
    texto: '',
    tipo: 'simples',
    ordem: 1,
    secao_id: '',
    opcoes: [],
    novaOpcao: '',
    obrigatoria: true
  });
  
  const [showAddPerguntaDialog, setShowAddPerguntaDialog] = useState(false);
  
  const handleAddSecao = async () => {
    if (!formularioId) {
      toast.error('Formulário não selecionado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('secoes')
        .insert([
          {
            titulo: novaSecao.titulo,
            descricao: novaSecao.descricao,
            formulario_id: formularioId,
            ordem: novaSecao.ordem || secoes.length + 1
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      const newSecoes = [...secoes, data[0] as Section];
      setSecoes(newSecoes);
      setNovaSecao({ id: '', titulo: '', descricao: '', ordem: newSecoes.length + 1 });
      setShowAddDialog(false);
      
      toast.success('Seção criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar seção');
      console.error(error);
    }
  };

  const handleUpdateSecao = async () => {
    if (!editingSecao) return;
    
    try {
      const { error } = await supabase
        .from('secoes')
        .update({
          titulo: editingSecao.titulo,
          descricao: editingSecao.descricao,
          ordem: editingSecao.ordem
        })
        .eq('id', editingSecao.id);

      if (error) {
        throw error;
      }

      setSecoes(prev => prev.map(s => s.id === editingSecao.id ? editingSecao : s));
      setEditingSecao(null);
      toast.success('Seção atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar seção');
      console.error(error);
    }
  };

  const handleDeleteSecao = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta seção? Todas as perguntas associadas também serão excluídas.')) {
      try {
        const { error } = await supabase
          .from('secoes')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setSecoes(prev => prev.filter(s => s.id !== id));
        toast.success('Seção excluída com sucesso!');
        if (refreshPerguntas) {
          refreshPerguntas();
        }
      } catch (error) {
        toast.error('Erro ao excluir seção');
        console.error(error);
      }
    }
  };

  const handleAddPergunta = async () => {
    if (!novaPergunta.texto || !novaPergunta.secao_id) {
      toast.error('Preencha o texto da pergunta e selecione uma seção');
      return;
    }

    try {
      const perguntaData = {
        texto: novaPergunta.texto,
        tipo: novaPergunta.tipo,
        ordem_pergunta: novaPergunta.ordem,
        secao_id: novaPergunta.secao_id,
        opcoes: novaPergunta.opcoes.length > 0 ? novaPergunta.opcoes : null,
        obrigatoria: novaPergunta.obrigatoria
      };

      const { data, error } = await supabase
        .from('perguntas')
        .insert([perguntaData])
        .select();

      if (error) {
        throw error;
      }

      toast.success('Pergunta criada com sucesso!');
      if (refreshPerguntas) {
        refreshPerguntas();
      }
      
      setNovaPergunta({
        texto: '',
        tipo: 'simples',
        ordem: 1,
        secao_id: '',
        opcoes: [],
        novaOpcao: '',
        obrigatoria: true
      });
      
      setShowAddPerguntaDialog(false);
    } catch (error) {
      toast.error('Erro ao criar pergunta');
      console.error(error);
    }
  };

  const handleAddOpcao = () => {
    if (!novaPergunta.novaOpcao) return;
    
    setNovaPergunta(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, prev.novaOpcao],
      novaOpcao: ''
    }));
  };

  const handleRemoveOpcao = (index: number) => {
    setNovaPergunta(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={activeTab === 'secoes' ? 'block' : 'hidden'}>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Seções do Formulário</h2>
        <div className="flex space-x-2">
          <Dialog open={showAddPerguntaDialog} onOpenChange={setShowAddPerguntaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Nova Pergunta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
                <DialogDescription>Crie uma nova pergunta para o formulário</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="secao">Seção</Label>
                  <Select 
                    value={novaPergunta.secao_id} 
                    onValueChange={value => setNovaPergunta({...novaPergunta, secao_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma seção" />
                    </SelectTrigger>
                    <SelectContent>
                      {secoes.map(secao => (
                        <SelectItem key={secao.id} value={secao.id}>{secao.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="perguntaTexto">Texto da Pergunta</Label>
                  <Textarea 
                    id="perguntaTexto" 
                    value={novaPergunta.texto}
                    onChange={e => setNovaPergunta({...novaPergunta, texto: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipoPergunta">Tipo de Pergunta</Label>
                  <Select 
                    value={novaPergunta.tipo} 
                    onValueChange={value => setNovaPergunta({...novaPergunta, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples">Simples (Sim/Não)</SelectItem>
                      <SelectItem value="multipla">Múltipla Escolha</SelectItem>
                      <SelectItem value="texto">Resposta de Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {novaPergunta.tipo === 'multipla' && (
                  <div className="space-y-2">
                    <Label>Opções de Resposta</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={novaPergunta.novaOpcao}
                        onChange={e => setNovaPergunta({...novaPergunta, novaOpcao: e.target.value})}
                        placeholder="Nova opção"
                      />
                      <Button type="button" onClick={handleAddOpcao} variant="outline">Adicionar</Button>
                    </div>
                    {novaPergunta.opcoes.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {novaPergunta.opcoes.map((opcao, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{opcao}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleRemoveOpcao(index)}
                            >
                              Remover
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="obrigatoria"
                    checked={novaPergunta.obrigatoria}
                    onCheckedChange={checked => setNovaPergunta({...novaPergunta, obrigatoria: checked})}
                  />
                  <Label htmlFor="obrigatoria">Resposta obrigatória</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPergunta}>Adicionar Pergunta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>Nova Seção</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Seção</DialogTitle>
                <DialogDescription>Crie uma nova seção para o formulário</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input 
                    id="titulo" 
                    value={novaSecao.titulo} 
                    onChange={e => setNovaSecao({...novaSecao, titulo: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    value={novaSecao.descricao} 
                    onChange={e => setNovaSecao({...novaSecao, descricao: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input 
                    id="ordem" 
                    type="number" 
                    value={novaSecao.ordem} 
                    onChange={e => setNovaSecao({...novaSecao, ordem: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSecao}>Adicionar Seção</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {secoes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Nenhuma seção encontrada para este formulário</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>Criar primeira seção</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {secoes.map((secao, index) => (
            <Card key={secao.id} className="relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {index + 1}. {secao.titulo}
                    </h3>
                    <p className="text-gray-500 mt-1">{secao.descricao}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpen(secao.id);
                      }}
                    >
                      Ver Perguntas
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSecao(secao)}
                        >
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Seção</DialogTitle>
                          <DialogDescription>Atualize as informações da seção</DialogDescription>
                        </DialogHeader>
                        {editingSecao && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-titulo">Título</Label>
                              <Input 
                                id="edit-titulo" 
                                value={editingSecao.titulo} 
                                onChange={e => setEditingSecao({...editingSecao, titulo: e.target.value})} 
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-descricao">Descrição</Label>
                              <Textarea 
                                id="edit-descricao" 
                                value={editingSecao.descricao} 
                                onChange={e => setEditingSecao({...editingSecao, descricao: e.target.value})} 
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-ordem">Ordem</Label>
                              <Input 
                                id="edit-ordem" 
                                type="number" 
                                value={editingSecao.ordem} 
                                onChange={e => setEditingSecao({...editingSecao, ordem: parseInt(e.target.value)})} 
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button onClick={handleUpdateSecao}>Salvar Alterações</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSecao(secao.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNovaPergunta({...novaPergunta, secao_id: secao.id});
                      setShowAddPerguntaDialog(true);
                    }}
                  >
                    Nova pergunta nesta seção
                  </Button>
                  <span className="text-sm text-gray-500">ID: {secao.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecoesTab;
