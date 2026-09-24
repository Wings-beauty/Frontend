export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
          requested_date: string | null;
          completed_at: string | null;
          error_message: string | null;
          requester_type: "user" | "guest" | null;
          guest_token_hash: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          requested_at?: string | null;
          requested_date?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          requester_type?: "user" | "guest" | null;
          guest_token_hash?: string | null;
        };
        Update: {
          user_id?: string | null;
          image_url?: string | null;
          status?: "pending" | "success" | "failed" | null;
          completed_at?: string | null;
          error_message?: string | null;
          requester_type?: "user" | "guest" | null;
          guest_token_hash?: string | null;
          requested_date?: string | null;
          requested_at?: string | null;
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
          email: string | null;
          source: string | null;
          tone_code: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          email?: string | null;
          source?: string | null;
          tone_code?: string | null;
        };
        Relationships: [];
      };
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
          email: string | null;
          nickname: string | null;
          profile_image_url: string | null;
          birth_year: number | null;
          skin_note: string | null;
          skin_tone: "spring" | "summer" | "autumn" | "winter" | null;
          role: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
          skin_tone?: "spring" | "summer" | "autumn" | "winter" | null;
          role?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          email?: string | null;
          nickname?: string | null;
          profile_image_url?: string | null;
          birth_year?: number | null;
          skin_note?: string | null;
          skin_tone?: "spring" | "summer" | "autumn" | "winter" | null;
          role?: string;
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
      popup_visitors: {
        Row: {
          event_key: string;
          user_id: string;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          referrer: string | null;
          landing_path: string | null;
          created_at: string;
        };
        Insert: {
          event_key: string;
          user_id?: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          referrer?: string | null;
          landing_path?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      popup_quiz_responses: {
        Row: {
          event_key: string;
          user_id: string;
          category: "skincare" | "makeup" | "hair" | "fragrance";
          criteria: "ingredient" | "price" | "brand" | "review";
          texture: "light" | "rich" | "matte";
          budget: "under_15000" | "15000_25000" | "over_25000";
          info_need: "ingredients_list" | "reviews" | "price_compare" | "try_in_person";
          recommended_keys: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_key: string;
          user_id?: string;
          category: "skincare" | "makeup" | "hair" | "fragrance";
          criteria: "ingredient" | "price" | "brand" | "review";
          texture: "light" | "rich" | "matte";
          budget: "under_15000" | "15000_25000" | "over_25000";
          info_need: "ingredients_list" | "reviews" | "price_compare" | "try_in_person";
          recommended_keys?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: "skincare" | "makeup" | "hair" | "fragrance";
          criteria?: "ingredient" | "price" | "brand" | "review";
          texture?: "light" | "rich" | "matte";
          budget?: "under_15000" | "15000_25000" | "over_25000";
          info_need?: "ingredients_list" | "reviews" | "price_compare" | "try_in_person";
          recommended_keys?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      popup_product_events: {
        Row: {
          id: number;
          event_key: string;
          user_id: string;
          product_key: string;
          event_type: "recommend" | "view" | "like" | "unlike";
          created_at: string;
        };
        Insert: {
          id?: never;
          event_key: string;
          user_id?: string;
          product_key: string;
          event_type: "recommend" | "view" | "like" | "unlike";
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      popup_wishlist: {
        Row: {
          event_key: string;
          user_id: string;
          product_key: string;
          created_at: string;
        };
        Insert: {
          event_key: string;
          user_id?: string;
          product_key: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      popup_visit_slots: {
        Row: {
          event_key: string;
          user_id: string;
          time_slot: "10-12" | "12-14" | "14-16";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_key: string;
          user_id?: string;
          time_slot: "10-12" | "12-14" | "14-16";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          time_slot?: "10-12" | "12-14" | "14-16";
          updated_at?: string;
        };
        Relationships: [];
      };
      popup_purchase_surveys: {
        Row: {
          event_key: string;
          user_id: string;
          product_keys: string[];
          reasons: string[];
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_key: string;
          user_id?: string;
          product_keys?: string[];
          reasons?: string[];
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_keys?: string[];
          reasons?: string[];
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      skin_tone: "spring" | "summer" | "autumn" | "winter";
    };
    CompositeTypes: Record<string, never>;
  };
};
