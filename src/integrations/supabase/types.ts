export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string
          email: string
          gateway_customer_id: string | null
          gateway_provider: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          gateway_customer_id?: string | null
          gateway_provider?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          gateway_customer_id?: string | null
          gateway_provider?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dados_diarios: {
        Row: {
          calls: number
          created_at: string
          data: string
          id: string
          leads_atendidos: number
          valor_entrada: number
          valor_venda: number
          vendas: number
          vendas_calls: number
          vendas_leads: number
          vendedor_id: string
        }
        Insert: {
          calls?: number
          created_at?: string
          data?: string
          id?: string
          leads_atendidos?: number
          valor_entrada?: number
          valor_venda?: number
          vendas?: number
          vendas_calls?: number
          vendas_leads?: number
          vendedor_id: string
        }
        Update: {
          calls?: number
          created_at?: string
          data?: string
          id?: string
          leads_atendidos?: number
          valor_entrada?: number
          valor_venda?: number
          vendas?: number
          vendas_calls?: number
          vendas_leads?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_diarios_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          calls_meta: number
          created_at: string
          id: string
          leads_meta: number
          mes: string
          updated_at: string
          valor_entrada_meta: number
          valor_vendas_meta: number
          vendas_meta: number
        }
        Insert: {
          calls_meta?: number
          created_at?: string
          id?: string
          leads_meta?: number
          mes: string
          updated_at?: string
          valor_entrada_meta?: number
          valor_vendas_meta?: number
          vendas_meta?: number
        }
        Update: {
          calls_meta?: number
          created_at?: string
          id?: string
          leads_meta?: number
          mes?: string
          updated_at?: string
          valor_entrada_meta?: number
          valor_vendas_meta?: number
          vendas_meta?: number
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          customer_id: string
          exp_month: number | null
          exp_year: number | null
          gateway_payment_method_id: string | null
          id: string
          is_default: boolean
          last_four_digits: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          customer_id: string
          exp_month?: number | null
          exp_year?: number | null
          gateway_payment_method_id?: string | null
          id?: string
          is_default?: boolean
          last_four_digits?: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          customer_id?: string
          exp_month?: number | null
          exp_year?: number | null
          gateway_payment_method_id?: string | null
          id?: string
          is_default?: boolean
          last_four_digits?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string
          gateway_invoice_id: string | null
          gateway_payment_id: string | null
          id: string
          paid_at: string | null
          payment_method_id: string | null
          refunded_at: string | null
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_id: string
          gateway_invoice_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          refunded_at?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string
          gateway_invoice_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          refunded_at?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          gateway_plan_id: string | null
          gateway_price_id: string | null
          id: string
          interval: string
          interval_count: number
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          gateway_plan_id?: string | null
          gateway_price_id?: string | null
          id?: string
          interval?: string
          interval_count?: number
          is_active?: boolean
          name: string
          price_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          gateway_plan_id?: string | null
          gateway_price_id?: string | null
          id?: string
          interval?: string
          interval_count?: number
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      squads: {
        Row: {
          cor: string | null
          created_at: string
          foto_url: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          gateway_subscription_id: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          gateway_subscription_id?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          gateway_subscription_id?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          cor_primaria: string
          cor_secundaria: string
          created_at: string
          id: string
          logo_url: string | null
          nome_sistema: string
          updated_at: string
        }
        Insert: {
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          nome_sistema?: string
          updated_at?: string
        }
        Update: {
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          nome_sistema?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendas_individuais: {
        Row: {
          created_at: string
          data: string
          id: string
          metodo_pagamento: string
          tipo_venda: string
          valor_entrada: number
          valor_venda: number
          vendedor_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          metodo_pagamento?: string
          tipo_venda?: string
          valor_entrada?: number
          valor_venda?: number
          vendedor_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          metodo_pagamento?: string
          tipo_venda?: string
          valor_entrada?: number
          valor_venda?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_individuais_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      vendedores: {
        Row: {
          cargo: string | null
          created_at: string
          foto_url: string | null
          id: string
          nome: string
          squad_id: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome: string
          squad_id?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string
          squad_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendedores_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      payment_method_type: "credit_card" | "debit_card" | "pix" | "boleto"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      payment_method_type: ["credit_card", "debit_card", "pix", "boleto"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "paused",
      ],
    },
  },
} as const
