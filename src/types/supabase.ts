<<<<<<< Updated upstream
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
=======
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
          requested_date: string | null;
          completed_at: string | null;
          error_message: string | null;
          requester_type: "user" | "guest" | null;
          guest_token_hash: string | null;
=======
          completed_at: string | null;
          error_message: string | null;
>>>>>>> Stashed changes
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          requested_at?: string | null;
<<<<<<< Updated upstream
          requested_date?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          requester_type?: "user" | "guest" | null;
          guest_token_hash?: string | null;
=======
          completed_at?: string | null;
          error_message?: string | null;
>>>>>>> Stashed changes
        };
        Update: {
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          completed_at?: string | null;
          error_message?: string | null;
<<<<<<< Updated upstream
          requester_type?: "user" | "guest" | null;
          guest_token_hash?: string | null;
          requested_date?: string | null;
          requested_at?: string | null;
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      feedbacks_result: {
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
          user_id: string | null;
=======
      launch_waitlist: {
        Row: {
          id: number;
>>>>>>> Stashed changes
          email: string | null;
          source: string | null;
          tone_code: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
<<<<<<< Updated upstream
          user_id?: string | null;
=======
>>>>>>> Stashed changes
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
          created_at?: string | null;
        };
        Update: {
<<<<<<< Updated upstream
          user_id?: string | null;
=======
>>>>>>> Stashed changes
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
        };
        Relationships: [];
      };
<<<<<<< Updated upstream
      inquiries: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          status: string;
          admin_reply: string | null;
          replied_by: string | null;
          replied_at: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          status?: string;
          admin_reply?: string | null;
          replied_by?: string | null;
          replied_at?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          title?: string;
          content?: string;
          status?: string;
          admin_reply?: string | null;
          replied_by?: string | null;
          replied_at?: string | null;
          is_deleted?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          email: string | null;
=======
>>>>>>> Stashed changes
          nickname: string | null;
          profile_image_url: string | null;
          birth_year: number | null;
          skin_note: string | null;
<<<<<<< Updated upstream
          skin_tone: "spring" | "summer" | "autumn" | "winter" | null;
          role: string;
=======
>>>>>>> Stashed changes
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
<<<<<<< Updated upstream
          email?: string | null;
=======
>>>>>>> Stashed changes
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
<<<<<<< Updated upstream
          skin_tone?: "spring" | "summer" | "autumn" | "winter" | null;
          role?: string;
=======
>>>>>>> Stashed changes
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
<<<<<<< Updated upstream
          email?: string | null;
=======
>>>>>>> Stashed changes
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
<<<<<<< Updated upstream
          skin_tone?: "spring" | "summer" | "autumn" | "winter" | null;
          role?: string;
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    Enums: {
      skin_tone: "spring" | "summer" | "autumn" | "winter";
    };
=======
    Enums: Record<string, never>;
>>>>>>> Stashed changes
    CompositeTypes: Record<string, never>;
  };
};
