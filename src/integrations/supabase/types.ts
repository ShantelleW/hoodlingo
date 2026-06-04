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
      categories: {
        Row: {
          created_at: string
          description: string | null
          emoji: string
          id: string
          is_active: boolean | null
          name: string
          question_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string
          id: string
          is_active?: boolean | null
          name: string
          question_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string
          id?: string
          is_active?: boolean | null
          name?: string
          question_count?: number | null
        }
        Relationships: []
      }
      category_masters: {
        Row: {
          approved_questions_count: number | null
          category: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          approved_questions_count?: number | null
          category: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          approved_questions_count?: number | null
          category?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_responses: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          responder_id: string
          score: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          responder_id: string
          score: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          responder_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_responses_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          category: string
          challenger_id: string
          challenger_score: number
          created_at: string
          id: string
          question_ids: string[]
          share_code: string
        }
        Insert: {
          category: string
          challenger_id: string
          challenger_score: number
          created_at?: string
          id?: string
          question_ids: string[]
          share_code: string
        }
        Update: {
          category?: string
          challenger_id?: string
          challenger_score?: number
          created_at?: string
          id?: string
          question_ids?: string[]
          share_code?: string
        }
        Relationships: []
      }
      og_votes: {
        Row: {
          created_at: string
          id: string
          og_user_id: string
          submission_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          og_user_id: string
          submission_id: string
          vote: boolean
        }
        Update: {
          created_at?: string
          id?: string
          og_user_id?: string
          submission_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "og_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "question_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          created_at: string
          display_name: string | null
          games_played: number | null
          has_paid: boolean | null
          id: string
          initials: string | null
          is_og: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          games_played?: number | null
          has_paid?: boolean | null
          id?: string
          initials?: string | null
          is_og?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          games_played?: number | null
          has_paid?: boolean | null
          id?: string
          initials?: string | null
          is_og?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_submissions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          hint: string | null
          id: string
          options: Json
          question: string
          result_commentary: string | null
          result_title: string | null
          status: string | null
          submitted_by: string
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string
          hint?: string | null
          id?: string
          options: Json
          question: string
          result_commentary?: string | null
          result_title?: string | null
          status?: string | null
          submitted_by: string
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          hint?: string | null
          id?: string
          options?: Json
          question?: string
          result_commentary?: string | null
          result_title?: string | null
          status?: string | null
          submitted_by?: string
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          hint: string | null
          id: string
          is_approved: boolean | null
          options: Json
          question: string
          result_commentary: string | null
          result_image_url: string | null
          result_title: string | null
          submitted_by: string | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string
          hint?: string | null
          id?: string
          is_approved?: boolean | null
          options: Json
          question: string
          result_commentary?: string | null
          result_image_url?: string | null
          result_title?: string | null
          submitted_by?: string | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          hint?: string | null
          id?: string
          is_approved?: boolean | null
          options?: Json
          question?: string
          result_commentary?: string | null
          result_image_url?: string | null
          result_title?: string | null
          submitted_by?: string | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          avatar_id: string
          category: string
          created_at: string
          id: string
          initials: string
          score: number
          user_id: string
        }
        Insert: {
          avatar_id: string
          category: string
          created_at?: string
          id?: string
          initials: string
          score?: number
          user_id: string
        }
        Update: {
          avatar_id?: string
          category?: string
          created_at?: string
          id?: string
          initials?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_player_stats: { Args: { _user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
