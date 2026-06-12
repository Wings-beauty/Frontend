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
      news: {
        Row: {
          id: number;
          title: string;
          category: string | null;
          content: string;
          author_id: string | null;
          is_published: boolean | null;
          published_at: string | null;
          thumbnail_url: string | null;
        };
        Insert: {
          id?: never;
          title: string;
          category?: string | null;
          content: string;
          author_id?: string | null;
          is_published?: boolean | null;
          published_at?: string | null;
          thumbnail_url?: string | null;
        };
        Update: {
          title?: string;
          category?: string | null;
          content?: string;
          author_id?: string | null;
          is_published?: boolean | null;
          published_at?: string | null;
          thumbnail_url?: string | null;
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
      community_posts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          category: string;
          content: string;
          thumbnail_url: string | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          is_deleted: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          title: string;
          category?: string;
          content: string;
          thumbnail_url?: string | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          is_deleted?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          content?: string;
          thumbnail_url?: string | null;
          is_deleted?: boolean;
          is_hidden?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_comments: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          content: string;
          is_deleted: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          post_id: number;
          user_id: string;
          content: string;
          is_deleted?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          is_deleted?: boolean;
          is_hidden?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      news_comments: {
        Row: {
          id: number;
          news_id: number;
          user_id: string;
          content: string;
          is_deleted: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          news_id: number;
          user_id: string;
          content: string;
          is_deleted?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          is_deleted?: boolean;
          is_hidden?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      news_cards: {
        Row: {
          id: number;
          news_id: number;
          card_order: number;
          image_url: string;
          title: string | null;
          content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          news_id: number;
          card_order: number;
          image_url: string;
          title?: string | null;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          card_order?: number;
          image_url?: string;
          title?: string | null;
          content?: string | null;
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
