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
      catalog_entries: {
        Row: {
          catalog: string;
          code: string;
          display_name: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: {
          catalog: string;
          code: string;
          display_name: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          catalog?: string;
          code?: string;
          display_name?: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      brands: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      private_collections: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      collections: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      lines: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      concentrations: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      perfumers: {
        Row: { id: string };
        Insert: { id?: string };
        Update: { id?: string };
        Relationships: [];
      };
      perfumes: {
        Row: {
          id: string;
          official_name: string;
          display_name: string;
          slug: string;
          brand_id: string;
          universe: Database["public"]["Enums"]["perfume_universe"] | null;
          private_collection_id: string | null;
          line_id: string | null;
          launch_year: number | null;
          concentration_id: string | null;
          commercial_concentration_label: string | null;
          declared_gender: Database["public"]["Enums"]["declared_gender"] | null;
          summary: string | null;
          official_description: string | null;
          no23_editorial: string | null;
          commercial_status: Database["public"]["Enums"]["commercial_status"];
          verification_status: Database["public"]["Enums"]["verification_status"];
          completeness_level: Database["public"]["Enums"]["completeness_level"];
        };
        Insert: {
          id?: string;
          official_name: string;
          display_name: string;
          slug: string;
          brand_id: string;
          universe?: Database["public"]["Enums"]["perfume_universe"] | null;
          private_collection_id?: string | null;
          line_id?: string | null;
          launch_year?: number | null;
          concentration_id?: string | null;
          commercial_concentration_label?: string | null;
          declared_gender?: Database["public"]["Enums"]["declared_gender"] | null;
          summary?: string | null;
          official_description?: string | null;
          no23_editorial?: string | null;
          commercial_status: Database["public"]["Enums"]["commercial_status"];
          verification_status: Database["public"]["Enums"]["verification_status"];
          completeness_level: Database["public"]["Enums"]["completeness_level"];
        };
        Update: {
          id?: string;
          official_name?: string;
          display_name?: string;
          slug?: string;
          brand_id?: string;
          universe?: Database["public"]["Enums"]["perfume_universe"] | null;
          private_collection_id?: string | null;
          line_id?: string | null;
          launch_year?: number | null;
          concentration_id?: string | null;
          commercial_concentration_label?: string | null;
          declared_gender?: Database["public"]["Enums"]["declared_gender"] | null;
          summary?: string | null;
          official_description?: string | null;
          no23_editorial?: string | null;
          commercial_status?: Database["public"]["Enums"]["commercial_status"];
          verification_status?: Database["public"]["Enums"]["verification_status"];
          completeness_level?: Database["public"]["Enums"]["completeness_level"];
        };
        Relationships: [
          {
            foreignKeyName: "perfumes_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfumes_private_collection_id_fkey";
            columns: ["private_collection_id"];
            isOneToOne: false;
            referencedRelation: "private_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfumes_line_id_fkey";
            columns: ["line_id"];
            isOneToOne: false;
            referencedRelation: "lines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfumes_concentration_id_fkey";
            columns: ["concentration_id"];
            isOneToOne: false;
            referencedRelation: "concentrations";
            referencedColumns: ["id"];
          },
        ];
      };
      perfume_collections: {
        Row: {
          perfume_id: string;
          collection_id: string;
          is_primary: boolean;
        };
        Insert: {
          perfume_id: string;
          collection_id: string;
          is_primary?: boolean;
        };
        Update: {
          perfume_id?: string;
          collection_id?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "perfume_collections_perfume_id_fkey";
            columns: ["perfume_id"];
            isOneToOne: false;
            referencedRelation: "perfumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfume_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      perfume_perfumers: {
        Row: {
          perfume_id: string;
          perfumer_id: string;
        };
        Insert: {
          perfume_id: string;
          perfumer_id: string;
        };
        Update: {
          perfume_id?: string;
          perfumer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "perfume_perfumers_perfume_id_fkey";
            columns: ["perfume_id"];
            isOneToOne: false;
            referencedRelation: "perfumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfume_perfumers_perfumer_id_fkey";
            columns: ["perfumer_id"];
            isOneToOne: false;
            referencedRelation: "perfumers";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: {
          id: string;
          type: string | null;
          title: string | null;
          publisher: string | null;
          author: string | null;
          url: string | null;
          published_on: string | null;
          consulted_on: string | null;
          entity: string | null;
          field_or_relation: string | null;
          value_snapshot: string | null;
          evidence_role: string | null;
          confidence: Database["public"]["Enums"]["confidence"] | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          type?: string | null;
          title?: string | null;
          publisher?: string | null;
          author?: string | null;
          url?: string | null;
          published_on?: string | null;
          consulted_on?: string | null;
          entity?: string | null;
          field_or_relation?: string | null;
          value_snapshot?: string | null;
          evidence_role?: string | null;
          confidence?: Database["public"]["Enums"]["confidence"] | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          type?: string | null;
          title?: string | null;
          publisher?: string | null;
          author?: string | null;
          url?: string | null;
          published_on?: string | null;
          consulted_on?: string | null;
          entity?: string | null;
          field_or_relation?: string | null;
          value_snapshot?: string | null;
          evidence_role?: string | null;
          confidence?: Database["public"]["Enums"]["confidence"] | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          entity: string | null;
          role: string | null;
          file_or_url: string | null;
          type: string | null;
          source: string | null;
          rights: string | null;
          approval: string | null;
          alt_text: string | null;
          is_primary: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          entity?: string | null;
          role?: string | null;
          file_or_url?: string | null;
          type?: string | null;
          source?: string | null;
          rights?: string | null;
          approval?: string | null;
          alt_text?: string | null;
          is_primary?: boolean;
          notes?: string | null;
        };
        Update: {
          id?: string;
          entity?: string | null;
          role?: string | null;
          file_or_url?: string | null;
          type?: string | null;
          source?: string | null;
          rights?: string | null;
          approval?: string | null;
          alt_text?: string | null;
          is_primary?: boolean;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      nature: "objective" | "editorial" | "calculated";
      verification_status:
        | "unverified"
        | "partially_verified"
        | "verified"
        | "disputed";
      commercial_status:
        | "active"
        | "discontinued"
        | "limited"
        | "upcoming"
        | "unknown";
      confidence: "very_low" | "low" | "medium" | "high" | "very_high";
      note_position:
        | "top"
        | "heart"
        | "base"
        | "unclassified"
        | "throughout"
        | "unknown";
      perfume_universe:
        | "designer"
        | "niche"
        | "arabic"
        | "indie"
        | "celebrity"
        | "inspiration";
      declared_gender: "masculine" | "feminine" | "unisex" | "unspecified";
      completeness_level: "minimum" | "standard" | "enriched" | "editorial";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
