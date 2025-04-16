export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          created_at: string
          empresa_id: string
          funcionario_id: string
          id: string
          is_complete: boolean | null
          last_updated: string
          notas_analista: string | null
          total_nao: number | null
          total_sim: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          funcionario_id: string
          id?: string
          is_complete?: boolean | null
          last_updated?: string
          notas_analista?: string | null
          total_nao?: number | null
          total_sim?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          funcionario_id?: string
          id?: string
          is_complete?: boolean | null
          last_updated?: string
          notas_analista?: string | null
          total_nao?: number | null
          total_sim?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_sistema: {
        Row: {
          cnpj: string
          contrato_id: string | null
          created_at: string
          email: string | null
          id: string
          plano_id: string | null
          razao_social: string
          responsavel: string | null
          situacao: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj: string
          contrato_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          plano_id?: string | null
          razao_social: string
          responsavel?: string | null
          situacao?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string
          contrato_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          plano_id?: string | null
          razao_social?: string
          responsavel?: string | null
          situacao?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_sistema_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_sistema_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          ciclo_faturamento: string
          ciclos_gerados: number | null
          cliente_id: string
          cliente_sistema_id: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          data_primeiro_vencimento: string
          id: string
          numero: string
          observacoes: string | null
          plano_id: string
          proxima_renovacao: string | null
          status: string
          taxa_implantacao: number
          updated_at: string
          valor_mensal: number
        }
        Insert: {
          ciclo_faturamento?: string
          ciclos_gerados?: number | null
          cliente_id: string
          cliente_sistema_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_primeiro_vencimento: string
          id?: string
          numero: string
          observacoes?: string | null
          plano_id: string
          proxima_renovacao?: string | null
          status?: string
          taxa_implantacao?: number
          updated_at?: string
          valor_mensal: number
        }
        Update: {
          ciclo_faturamento?: string
          ciclos_gerados?: number | null
          cliente_id?: string
          cliente_sistema_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_primeiro_vencimento?: string
          id?: string
          numero?: string
          observacoes?: string | null
          plano_id?: string
          proxima_renovacao?: string | null
          status?: string
          taxa_implantacao?: number
          updated_at?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_sistema_id_fkey"
            columns: ["cliente_sistema_id"]
            isOneToOne: false
            referencedRelation: "clientes_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cep: string | null
          cidade: string | null
          contato: string | null
          cpf_cnpj: string | null
          created_at: string
          data_inclusao: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero_empregados: number | null
          perfil_id: string | null
          situacao: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          contato?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_inclusao?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero_empregados?: number | null
          perfil_id?: string | null
          situacao?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          contato?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_inclusao?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero_empregados?: number | null
          perfil_id?: string | null
          situacao?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          cliente_id: string
          cliente_sistema_id: string | null
          contrato_id: string | null
          created_at: string
          data_emissao: string
          data_vencimento: string
          id: string
          numero: string
          referencia: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_id: string
          cliente_sistema_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento: string
          id?: string
          numero: string
          referencia?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          cliente_id?: string
          cliente_sistema_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento?: string
          id?: string
          numero?: string
          referencia?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_sistema_id_fkey"
            columns: ["cliente_sistema_id"]
            isOneToOne: false
            referencedRelation: "clientes_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          cargo_id: string | null
          cpf: string | null
          created_at: string
          empresa_id: string
          id: string
          nome: string
          setor_id: string | null
          updated_at: string
        }
        Insert: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          setor_id?: string | null
          updated_at?: string
        }
        Update: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          setor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      mitigacoes: {
        Row: {
          created_at: string
          id: string
          risco_id: string
          texto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          risco_id: string
          texto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          risco_id?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mitigacoes_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      perguntas: {
        Row: {
          created_at: string
          id: string
          observacao_obrigatoria: boolean | null
          opcoes: Json | null
          risco_id: string
          secao: string
          texto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacao_obrigatoria?: boolean | null
          opcoes?: Json | null
          risco_id: string
          secao: string
          texto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          observacao_obrigatoria?: boolean | null
          opcoes?: Json | null
          risco_id?: string
          secao?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean | null
          created_at: string
          data_validade: string | null
          descricao: string | null
          empregados_ilimitados: boolean | null
          empresas_ilimitadas: boolean | null
          id: string
          limite_empregados: number | null
          limite_empresas: number | null
          nome: string
          sem_vencimento: boolean | null
          updated_at: string
          valor_implantacao: number
          valor_mensal: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          data_validade?: string | null
          descricao?: string | null
          empregados_ilimitados?: boolean | null
          empresas_ilimitadas?: boolean | null
          id?: string
          limite_empregados?: number | null
          limite_empresas?: number | null
          nome: string
          sem_vencimento?: boolean | null
          updated_at?: string
          valor_implantacao?: number
          valor_mensal: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          data_validade?: string | null
          descricao?: string | null
          empregados_ilimitados?: boolean | null
          empresas_ilimitadas?: boolean | null
          id?: string
          limite_empregados?: number | null
          limite_empresas?: number | null
          nome?: string
          sem_vencimento?: boolean | null
          updated_at?: string
          valor_implantacao?: number
          valor_mensal?: number
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          avaliacao_id: string | null
          caminho_arquivo: string | null
          created_at: string
          data_geracao: string
          empresa_id: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          avaliacao_id?: string | null
          caminho_arquivo?: string | null
          created_at?: string
          data_geracao?: string
          empresa_id: string
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          avaliacao_id?: string | null
          caminho_arquivo?: string | null
          created_at?: string
          data_geracao?: string
          empresa_id?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          avaliacao_id: string
          created_at: string
          id: string
          observacao: string | null
          opcoes_selecionadas: Json | null
          pergunta_id: string
          resposta: boolean | null
          updated_at: string
        }
        Insert: {
          avaliacao_id: string
          created_at?: string
          id?: string
          observacao?: string | null
          opcoes_selecionadas?: Json | null
          pergunta_id: string
          resposta?: boolean | null
          updated_at?: string
        }
        Update: {
          avaliacao_id?: string
          created_at?: string
          id?: string
          observacao?: string | null
          opcoes_selecionadas?: Json | null
          pergunta_id?: string
          resposta?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos: {
        Row: {
          created_at: string
          id: string
          severidade_id: string
          texto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          severidade_id: string
          texto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          severidade_id?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "riscos_severidade_id_fkey"
            columns: ["severidade_id"]
            isOneToOne: false
            referencedRelation: "severidade"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "setores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      severidade: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nivel: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nivel: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nivel?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
