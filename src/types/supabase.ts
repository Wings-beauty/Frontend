export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      diagnosis_requests: {
        Row: {
          id: number;
          user_id: string | null;
          image_url: string | null;
          status: "pending" | "success" | "failed" | null;
          requested_at: string | null;
          completed_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          requested_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          completed_at?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
      diagnosis_results: {
        Row: {
          id: number;
          request_id: number | null;
          user_id: string | null;
          tone_code: string | null;
          tone_label: string | null;
          confidence: number | null;
          raw_result: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          request_id?: number | null;
          user_id?: string | null;
          tone_code?: string | null;
          tone_label?: string | null;
          confidence?: number | null;
          raw_result?: Json | null;
          created_at?: string | null;
        };
        Update: {
          request_id?: number | null;
          user_id?: string | null;
          tone_code?: string | null;
          tone_label?: string | null;
          confidence?: number | null;
          raw_result?: Json | null;
        };
        Relationships: [];
      };
      feedbacks: {
        Row: {
          id: number;
          user_id: string | null;
          diagnosis_result_id: number | null;
          rating: number | null;
          is_match: boolean | null;
          comment: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          diagnosis_result_id?: number | null;
          rating?: number | null;
          is_match?: boolean | null;
          comment?: string | null;
          created_at?: string | null;
        };
        Update: {
          rating?: number | null;
          is_match?: boolean | null;
          comment?: string | null;
        };
        Relationships: [];
      };
      launch_waitlist: {
        Row: {
          id: number;
          email: string | null;
          source: string | null;
          tone_code: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
          created_at?: string | null;
        };
        Update: {
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
        };
        Relationships: [];
      };
      product_tone_tags: {
        Row: {
          id: number;
          product_id: number | null;
          tone_code: string | null;
          score: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          product_id?: number | null;
          tone_code?: string | null;
          score?: number | null;
          created_at?: string | null;
        };
        Update: {
          product_id?: number | null;
          tone_code?: string | null;
          score?: number | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          brand_name: string | null;
          product_name: string | null;
          product_color: string | null;
          category: string | null;
          color_hex: string | null;
          hue: number | null;
          saturation: number | null;
          brightness: number | null;
          tone_type: string | null;
          detailed_tone: string | null;
          lip_type: string | null;
          texture: string | null;
          recommended_skin_type: string | null;
          product_image_url: string | null;
          price: number | null;
          product_url: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: never;
          brand_name?: string | null;
          product_name?: string | null;
          product_color?: string | null;
          category?: string | null;
          color_hex?: string | null;
          hue?: number | null;
          saturation?: number | null;
          brightness?: number | null;
          tone_type?: string | null;
          detailed_tone?: string | null;
          lip_type?: string | null;
          texture?: string | null;
          recommended_skin_type?: string | null;
          product_image_url?: string | null;
          price?: number | null;
          product_url?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          brand_name?: string | null;
          product_name?: string | null;
          product_color?: string | null;
          category?: string | null;
          color_hex?: string | null;
          hue?: number | null;
          saturation?: number | null;
          brightness?: number | null;
          tone_type?: string | null;
          detailed_tone?: string | null;
          lip_type?: string | null;
          texture?: string | null;
          recommended_skin_type?: string | null;
          product_image_url?: string | null;
          price?: number | null;
          product_url?: string | null;
          is_active?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          profile_image_url: string | null;
          birth_year: number | null;
          skin_note: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      saved_products: {
        Row: {
          id: number;
          user_id: string | null;
          product_id: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          product_id?: number | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          product_id?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
