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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string | null
          created_at: string
          detail: string | null
          id: string
          property_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          property_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          property_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_details: string | null
          area: string | null
          created_at: string
          created_by: string | null
          currency: string
          deed_type: string | null
          direction: string | null
          facade: string | null
          facebook_url: string | null
          features: string[]
          finishing: string | null
          floor: number | null
          governorate: string | null
          has_elevator24: boolean
          has_garden: boolean
          has_roof: boolean
          has_roof_garage: boolean
          has_salon: boolean
          id: string
          is_direct: boolean
          is_duplex: boolean
          is_suspended: boolean
          listing_type: string | null
          notes: string | null
          office_name: string | null
          office_phone: string | null
          owner_name: string | null
          owner_phone: string | null
          ownership_notes: string | null
          ownership_type: string | null
          partners: number | null
          photos: string[]
          price: number | null
          price_period: string | null
          property_type: string | null
          ref_no: number
          rent_end_date: string | null
          rooms: number | null
          size: number | null
          status: string
          title: string | null
          updated_at: string
          updated_by: string | null
          videos: string[]
          workspace_id: string
        }
        Insert: {
          address_details?: string | null
          area?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deed_type?: string | null
          direction?: string | null
          facade?: string | null
          facebook_url?: string | null
          features?: string[]
          finishing?: string | null
          floor?: number | null
          governorate?: string | null
          has_elevator24?: boolean
          has_garden?: boolean
          has_roof?: boolean
          has_roof_garage?: boolean
          has_salon?: boolean
          id?: string
          is_direct?: boolean
          is_duplex?: boolean
          is_suspended?: boolean
          listing_type?: string | null
          notes?: string | null
          office_name?: string | null
          office_phone?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_notes?: string | null
          ownership_type?: string | null
          partners?: number | null
          photos?: string[]
          price?: number | null
          price_period?: string | null
          property_type?: string | null
          ref_no?: number
          rent_end_date?: string | null
          rooms?: number | null
          size?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          videos?: string[]
          workspace_id: string
        }
        Update: {
          address_details?: string | null
          area?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deed_type?: string | null
          direction?: string | null
          facade?: string | null
          facebook_url?: string | null
          features?: string[]
          finishing?: string | null
          floor?: number | null
          governorate?: string | null
          has_elevator24?: boolean
          has_garden?: boolean
          has_roof?: boolean
          has_roof_garage?: boolean
          has_salon?: boolean
          id?: string
          is_direct?: boolean
          is_duplex?: boolean
          is_suspended?: boolean
          listing_type?: string | null
          notes?: string | null
          office_name?: string | null
          office_phone?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_notes?: string | null
          ownership_type?: string | null
          partners?: number | null
          photos?: string[]
          price?: number | null
          price_period?: string | null
          property_type?: string | null
          ref_no?: number
          rent_end_date?: string | null
          rooms?: number | null
          size?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          videos?: string[]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          code: string
          created_at: string
          employee_hash: string
          id: string
          manager_hash: string
          name: string
          owner_name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          employee_hash: string
          id?: string
          manager_hash: string
          name: string
          owner_name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          employee_hash?: string
          id?: string
          manager_hash?: string
          name?: string
          owner_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
