// Auto-generated Supabase Database types for Nexos Investment
// Schema source: supabase/migrations/001_initial_schema.sql
// Regenerate with: npx supabase gen types typescript --project-id "$PROJECT_ID" > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type PropertyTypeEnum =
  | "apartment"
  | "villa"
  | "detached"
  | "land"
  | "office"
  | "shop"
  | "warehouse";

export type TransactionTypeEnum = "sale" | "rent";

export type PropertyStatusEnum = "available" | "sold" | "rented" | "reserved";
export type PropertyWorkflowStatusEnum =
  | "draft"
  | "published"
  | "passive"
  | "archived";

export type HeatingTypeEnum =
  | "none"
  | "central"
  | "natural_gas"
  | "floor_heating"
  | "electric"
  | "solar"
  | "coal"
  | "air_condition";

export type CurrencyEnum = "TRY" | "USD" | "EUR" | "GBP";

export type FeatureCategoryEnum =
  | "interior"
  | "exterior"
  | "building"
  | "neighborhood";

export type ContactStatusEnum = "new" | "in_progress" | "resolved" | "spam";

export type OfferStatusEnum =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

// ---------------------------------------------------------------------------
// Database type
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      // -----------------------------------------------------------------------
      // cities
      // -----------------------------------------------------------------------
      cities: {
        Row: {
          id: number;
          name: string;
          slug: string;
          plate_code: number | null;
          lat: number | null;
          lng: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          plate_code?: number | null;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          plate_code?: number | null;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // districts
      // -----------------------------------------------------------------------
      districts: {
        Row: {
          id: number;
          city_id: number;
          name: string;
          slug: string;
          lat: number | null;
          lng: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          city_id: number;
          name: string;
          slug: string;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          city_id?: number;
          name?: string;
          slug?: string;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // neighborhoods
      // -----------------------------------------------------------------------
      neighborhoods: {
        Row: {
          id: number;
          district_id: number;
          name: string;
          slug: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          district_id: number;
          name: string;
          slug: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          district_id?: number;
          name?: string;
          slug?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // agents
      // -----------------------------------------------------------------------
      agents: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          title: string | null;
          slug: string;
          phone: string | null;
          email: string | null;
          photo_url: string | null;
          cover_image: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          title?: string | null;
          slug: string;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          cover_image?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          title?: string | null;
          slug?: string;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          cover_image?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // features
      // -----------------------------------------------------------------------
      features: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          category: FeatureCategoryEnum;
          sort_order: number;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          icon?: string | null;
          category: FeatureCategoryEnum;
          sort_order?: number;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          icon?: string | null;
          category?: FeatureCategoryEnum;
          sort_order?: number;
        };
      };

      // -----------------------------------------------------------------------
      // properties
      // -----------------------------------------------------------------------
      properties: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          price: number | null;
          pricing_type: "fixed" | "exchange" | "offer" | "kat_karsiligi";
          price_per_donum: number | null;
          currency: CurrencyEnum;
          type: PropertyTypeEnum;
          status: PropertyStatusEnum;
          transaction_type: TransactionTypeEnum;
          area_sqm: number | null;
          gross_area_sqm: number | null;
          rooms: number | null;
          living_rooms: number | null;
          bathrooms: number | null;
          floor: number | null;
          total_floors: number | null;
          year_built: number | null;
          heating_type: HeatingTypeEnum;
          parking: boolean | null;
          parking_type: string | null;
          furnished: boolean | null;
          balcony_count: number;
          elevator: boolean | null;
          pool: boolean | null;
          pool_type: string | null;
          garden: boolean | null;
          security_24_7: boolean | null;
          land_area_sqm: number | null;
          title_deed_type: string | null;
          has_road_access: boolean | null;
          has_electricity: boolean | null;
          has_water: boolean | null;
          zoning_status: string | null;
          min_rental_period: string | null;
          rental_payment_interval: string | null;
          internal_notes: string | null;
          listing_number: number;
          lat: number | null;
          lng: number | null;
          address: string | null;
          city_id: number;
          district_id: number | null;
          neighborhood_id: number | null;
          agent_id: string | null;
          is_featured: boolean;
          is_active: boolean;
          workflow_status: PropertyWorkflowStatusEnum;
          show_on_map: boolean;
          views_count: number;
          seo_title: string | null;
          seo_description: string | null;
          video_url: string | null;
          virtual_tour_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          price?: number | null;
          pricing_type?: "fixed" | "exchange" | "offer" | "kat_karsiligi";
          price_per_donum?: number | null;
          currency?: CurrencyEnum;
          type: PropertyTypeEnum;
          status?: PropertyStatusEnum;
          transaction_type: TransactionTypeEnum;
          area_sqm?: number | null;
          gross_area_sqm?: number | null;
          rooms?: number | null;
          living_rooms?: number | null;
          bathrooms?: number | null;
          floor?: number | null;
          total_floors?: number | null;
          year_built?: number | null;
          heating_type?: HeatingTypeEnum;
          parking?: boolean | null;
          parking_type?: string | null;
          furnished?: boolean | null;
          balcony_count?: number;
          elevator?: boolean | null;
          pool?: boolean | null;
          pool_type?: string | null;
          garden?: boolean | null;
          security_24_7?: boolean | null;
          land_area_sqm?: number | null;
          title_deed_type?: string | null;
          has_road_access?: boolean | null;
          has_electricity?: boolean | null;
          has_water?: boolean | null;
          zoning_status?: string | null;
          min_rental_period?: string | null;
          rental_payment_interval?: string | null;
          internal_notes?: string | null;
          listing_number?: number;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          city_id: number;
          district_id?: number | null;
          neighborhood_id?: number | null;
          agent_id?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          workflow_status?: PropertyWorkflowStatusEnum;
          show_on_map?: boolean;
          views_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          video_url?: string | null;
          virtual_tour_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          price?: number | null;
          pricing_type?: "fixed" | "exchange" | "offer" | "kat_karsiligi";
          price_per_donum?: number | null;
          currency?: CurrencyEnum;
          type?: PropertyTypeEnum;
          status?: PropertyStatusEnum;
          transaction_type?: TransactionTypeEnum;
          area_sqm?: number | null;
          gross_area_sqm?: number | null;
          rooms?: number | null;
          living_rooms?: number | null;
          bathrooms?: number | null;
          floor?: number | null;
          total_floors?: number | null;
          year_built?: number | null;
          heating_type?: HeatingTypeEnum;
          parking?: boolean | null;
          parking_type?: string | null;
          furnished?: boolean | null;
          balcony_count?: number;
          elevator?: boolean | null;
          pool?: boolean | null;
          pool_type?: string | null;
          garden?: boolean | null;
          security_24_7?: boolean | null;
          land_area_sqm?: number | null;
          title_deed_type?: string | null;
          has_road_access?: boolean | null;
          has_electricity?: boolean | null;
          has_water?: boolean | null;
          zoning_status?: string | null;
          min_rental_period?: string | null;
          rental_payment_interval?: string | null;
          internal_notes?: string | null;
          listing_number?: number;
          lat?: number | null;
          lng?: number | null;
          address?: string | null;
          city_id?: number;
          district_id?: number | null;
          neighborhood_id?: number | null;
          agent_id?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          workflow_status?: PropertyWorkflowStatusEnum;
          show_on_map?: boolean;
          views_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          video_url?: string | null;
          virtual_tour_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // property_images
      // -----------------------------------------------------------------------
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // property_features (join table — composite PK, no surrogate key)
      // -----------------------------------------------------------------------
      property_features: {
        Row: {
          property_id: string;
          feature_id: number;
        };
        Insert: {
          property_id: string;
          feature_id: number;
        };
        Update: {
          property_id?: string;
          feature_id?: number;
        };
      };

      // -----------------------------------------------------------------------
      // contact_requests
      // -----------------------------------------------------------------------
      contact_requests: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          message: string;
          property_id: string | null;
          agent_id: string | null;
          status: ContactStatusEnum;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          message: string;
          property_id?: string | null;
          agent_id?: string | null;
          status?: ContactStatusEnum;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          message?: string;
          property_id?: string | null;
          agent_id?: string | null;
          status?: ContactStatusEnum;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // blog_posts
      // -----------------------------------------------------------------------
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image: string | null;
          author: string;
          published_at: string | null;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          cover_image?: string | null;
          author: string;
          published_at?: string | null;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image?: string | null;
          author?: string;
          published_at?: string | null;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // pages
      // -----------------------------------------------------------------------
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          seo_title: string | null;
          seo_description: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // site_settings (key is the PK)
      // -----------------------------------------------------------------------
      site_settings: {
        Row: {
          key: string;
          value: string | null;
          value_type: string;
          label: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          value_type?: string;
          label?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          value_type?: string;
          label?: string | null;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // favorites (composite PK — no surrogate key)
      // -----------------------------------------------------------------------
      favorites: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // comparisons
      // -----------------------------------------------------------------------
      comparisons: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          property_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          property_ids: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          property_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // custom_offers
      // -----------------------------------------------------------------------
      custom_offers: {
        Row: {
          id: string;
          property_id: string;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          offer_price: number;
          currency: CurrencyEnum;
          notes: string | null;
          status: OfferStatusEnum;
          expires_at: string | null;
          sent_at: string | null;
          responded_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          customer_name: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          offer_price: number;
          currency?: CurrencyEnum;
          notes?: string | null;
          status?: OfferStatusEnum;
          expires_at?: string | null;
          sent_at?: string | null;
          responded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          customer_name?: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          offer_price?: number;
          currency?: CurrencyEnum;
          notes?: string | null;
          status?: OfferStatusEnum;
          expires_at?: string | null;
          sent_at?: string | null;
          responded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    Enums: {
      property_type_enum: PropertyTypeEnum;
      transaction_type_enum: TransactionTypeEnum;
      property_status_enum: PropertyStatusEnum;
      property_workflow_status_enum: PropertyWorkflowStatusEnum;
      heating_type_enum: HeatingTypeEnum;
      currency_enum: CurrencyEnum;
      feature_category_enum: FeatureCategoryEnum;
      contact_status_enum: ContactStatusEnum;
      offer_status_enum: OfferStatusEnum;
    };

    CompositeTypes: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// Convenience helpers — mirrors the pattern from the Supabase CLI output
// ---------------------------------------------------------------------------

type PublicSchema = Database["public"];

/** Row type for any public table. */
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

/** Insert type for any public table. */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** Update type for any public table. */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

/** Enum type for any public enum. */
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
