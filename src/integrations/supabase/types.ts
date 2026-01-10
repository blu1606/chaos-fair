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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          auto_refill_amount: number | null
          auto_refill_enabled: boolean | null
          auto_refill_threshold: number | null
          auto_renew: boolean | null
          available_credits: number | null
          created_at: string | null
          id: string
          plan_limit: number | null
          plan_type: string
          subscription_end: string | null
          subscription_start: string | null
          total_credits: number | null
          updated_at: string | null
          used_credits: number | null
          user_id: string
        }
        Insert: {
          auto_refill_amount?: number | null
          auto_refill_enabled?: boolean | null
          auto_refill_threshold?: number | null
          auto_renew?: boolean | null
          available_credits?: number | null
          created_at?: string | null
          id?: string
          plan_limit?: number | null
          plan_type?: string
          subscription_end?: string | null
          subscription_start?: string | null
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id: string
        }
        Update: {
          auto_refill_amount?: number | null
          auto_refill_enabled?: boolean | null
          auto_refill_threshold?: number | null
          auto_renew?: boolean | null
          available_credits?: number | null
          created_at?: string | null
          id?: string
          plan_limit?: number | null
          plan_type?: string
          subscription_end?: string | null
          subscription_start?: string | null
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_daily: {
        Row: {
          average_latency_ms: number | null
          created_at: string | null
          date: string
          id: string
          top_endpoint: string | null
          total_cost: number | null
          total_requests: number | null
          total_requests_error: number | null
          total_requests_success: number | null
          unique_endpoints: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_latency_ms?: number | null
          created_at?: string | null
          date: string
          id?: string
          top_endpoint?: string | null
          total_cost?: number | null
          total_requests?: number | null
          total_requests_error?: number | null
          total_requests_success?: number | null
          unique_endpoints?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_latency_ms?: number | null
          created_at?: string | null
          date?: string
          id?: string
          top_endpoint?: string | null
          total_cost?: number | null
          total_requests?: number | null
          total_requests_error?: number | null
          total_requests_success?: number | null
          unique_endpoints?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string | null
          key_preview: string | null
          last_ip_address: unknown
          last_used_at: string | null
          name: string
          permissions: Json | null
          rate_limit_daily: number | null
          rate_limit_rph: number | null
          rate_limit_rpm: number | null
          revoked_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix?: string | null
          key_preview?: string | null
          last_ip_address?: unknown
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          rate_limit_daily?: number | null
          rate_limit_rph?: number | null
          rate_limit_rpm?: number | null
          revoked_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string | null
          key_preview?: string | null
          last_ip_address?: unknown
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          rate_limit_daily?: number | null
          rate_limit_rph?: number | null
          rate_limit_rpm?: number | null
          revoked_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          stripe_invoice_id: string | null
          stripe_transaction_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          stripe_invoice_id?: string | null
          stripe_transaction_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          stripe_invoice_id?: string | null
          stripe_transaction_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          dismissed: boolean | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          message: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email_verified_at: string | null
          id: string
          name: string
          organization_name: string | null
          plan_type: string
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email_verified_at?: string | null
          id: string
          name: string
          organization_name?: string | null
          plan_type?: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email_verified_at?: string | null
          id?: string
          name?: string
          organization_name?: string | null
          plan_type?: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      randomness_records: {
        Row: {
          api_key_id: string | null
          cost_credits: number | null
          count: number
          created_at: string | null
          epoch: number
          format: string
          id: string
          latency_ms: number | null
          max_value: number | null
          min_value: number | null
          on_chain_proof: string | null
          on_chain_signature: string | null
          timestamp: string | null
          user_id: string
          verification_data: Json | null
          verified: boolean | null
          verified_at: string | null
          walrus_object_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          cost_credits?: number | null
          count: number
          created_at?: string | null
          epoch: number
          format: string
          id?: string
          latency_ms?: number | null
          max_value?: number | null
          min_value?: number | null
          on_chain_proof?: string | null
          on_chain_signature?: string | null
          timestamp?: string | null
          user_id: string
          verification_data?: Json | null
          verified?: boolean | null
          verified_at?: string | null
          walrus_object_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          cost_credits?: number | null
          count?: number
          created_at?: string | null
          epoch?: number
          format?: string
          id?: string
          latency_ms?: number | null
          max_value?: number | null
          min_value?: number | null
          on_chain_proof?: string | null
          on_chain_signature?: string | null
          timestamp?: string | null
          user_id?: string
          verification_data?: Json | null
          verified?: boolean | null
          verified_at?: string | null
          walrus_object_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "randomness_records_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      request_logs: {
        Row: {
          api_key_id: string | null
          cost_credits: number | null
          country_code: string | null
          created_at: string | null
          endpoint: string
          error_code: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          method: string
          on_chain_epoch: number | null
          on_chain_tx_hash: string | null
          query_params: Json | null
          region: string | null
          request_body: Json | null
          request_count: number | null
          response_body: Json | null
          response_status: number
          response_time_ms: number | null
          user_agent: string | null
          user_id: string
          walrus_object_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          cost_credits?: number | null
          country_code?: string | null
          created_at?: string | null
          endpoint: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address: unknown
          metadata?: Json | null
          method: string
          on_chain_epoch?: number | null
          on_chain_tx_hash?: string | null
          query_params?: Json | null
          region?: string | null
          request_body?: Json | null
          request_count?: number | null
          response_body?: Json | null
          response_status: number
          response_time_ms?: number | null
          user_agent?: string | null
          user_id: string
          walrus_object_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          cost_credits?: number | null
          country_code?: string | null
          created_at?: string | null
          endpoint?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method?: string
          on_chain_epoch?: number | null
          on_chain_tx_hash?: string | null
          query_params?: Json | null
          region?: string | null
          request_body?: Json | null
          request_count?: number | null
          response_body?: Json | null
          response_status?: number
          response_time_ms?: number | null
          user_agent?: string | null
          user_id?: string
          walrus_object_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          object_id: string
          object_type: string
          title: string | null
          tsv: unknown
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          object_id: string
          object_type: string
          title?: string | null
          tsv?: unknown
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          object_id?: string
          object_type?: string
          title?: string | null
          tsv?: unknown
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: { Args: never; Returns: string }
      get_usage_stats: {
        Args: { p_api_key_id: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_response_time: number
          error_requests: number
          success_requests: number
          total_requests: number
        }[]
      }
      hash_api_key: { Args: { key: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
