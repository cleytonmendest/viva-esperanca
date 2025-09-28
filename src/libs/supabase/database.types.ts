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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      event_assignments: {
        Row: {
          created_at: string
          event_id: string
          id: string
          member_id: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          task_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          task_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          birthdate: string
          created_at: string
          id: string
          name: string
          phone: string
          role: Database["public"]["Enums"]["user_role_enum"]
          sector: Database["public"]["Enums"]["sector_enum"][] | null
          status: Database["public"]["Enums"]["member_status_enum"]
          user_id: string | null
        }
        Insert: {
          birthdate: string
          created_at?: string
          id?: string
          name: string
          phone: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          sector?: Database["public"]["Enums"]["sector_enum"][] | null
          status?: Database["public"]["Enums"]["member_status_enum"]
          user_id?: string | null
        }
        Update: {
          birthdate?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          sector?: Database["public"]["Enums"]["sector_enum"][] | null
          status?: Database["public"]["Enums"]["member_status_enum"]
          user_id?: string | null
        }
        Relationships: []
      }
      message: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          phone: string
          status: Database["public"]["Enums"]["status_enum"]
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          phone: string
          status?: Database["public"]["Enums"]["status_enum"]
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          phone?: string
          status?: Database["public"]["Enums"]["status_enum"]
        }
        Relationships: []
      }
      page_permissions: {
        Row: {
          allowed_roles: Database["public"]["Enums"]["user_role_enum"][]
          created_at: string
          icon: string | null
          id: string
          page_name: string
          page_path: string
        }
        Insert: {
          allowed_roles: Database["public"]["Enums"]["user_role_enum"][]
          created_at?: string
          icon?: string | null
          id?: string
          page_name: string
          page_path: string
        }
        Update: {
          allowed_roles?: Database["public"]["Enums"]["user_role_enum"][]
          created_at?: string
          icon?: string | null
          id?: string
          page_name?: string
          page_path?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          sector: Database["public"]["Enums"]["sector_enum"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          sector?: Database["public"]["Enums"]["sector_enum"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          sector?: Database["public"]["Enums"]["sector_enum"] | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string
          event_name: string | null
          first_time: boolean
          id: string
          invited_by: string | null
          visite_date: string
          visitor_name: string
          visitor_status:
            | Database["public"]["Enums"]["visitor_status_enum"]
            | null
          visitor_whatsapp: string
        }
        Insert: {
          created_at?: string
          event_name?: string | null
          first_time?: boolean
          id?: string
          invited_by?: string | null
          visite_date: string
          visitor_name: string
          visitor_status?:
            | Database["public"]["Enums"]["visitor_status_enum"]
            | null
          visitor_whatsapp: string
        }
        Update: {
          created_at?: string
          event_name?: string | null
          first_time?: boolean
          id?: string
          invited_by?: string | null
          visite_date?: string
          visitor_name?: string
          visitor_status?:
            | Database["public"]["Enums"]["visitor_status_enum"]
            | null
          visitor_whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assignment_status: "pendente" | "confirmado" | "recusado"
      member_status_enum: "ativo" | "inativo"
      sector_enum: "mídia" | "geral" | "louvor" | "infantil" | "social"
      status_enum: "pending" | "processing" | "sent" | "failed"
      user_role_enum:
        | "admin"
        | "pastor(a)"
        | "lider_midia"
        | "lider_geral"
        | "pendente"
        | "membro"
      visitor_status_enum:
        | "sem_igreja"
        | "visitante_outra_igreja"
        | "afastado"
        | "indeciso"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assignment_status: ["pendente", "confirmado", "recusado"],
      member_status_enum: ["ativo", "inativo"],
      sector_enum: ["mídia", "geral", "louvor", "infantil", "social"],
      status_enum: ["pending", "processing", "sent", "failed"],
      user_role_enum: [
        "admin",
        "pastor(a)",
        "lider_midia",
        "lider_geral",
        "pendente",
        "membro",
      ],
      visitor_status_enum: [
        "sem_igreja",
        "visitante_outra_igreja",
        "afastado",
        "indeciso",
      ],
    },
  },
} as const
