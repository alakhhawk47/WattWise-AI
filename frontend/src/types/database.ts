// Supabase Database TypeScript Definitions

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id">>;

export interface DbClassroom {
  id: string;
  room_code: string;
  building: string;
  floor: number;
  capacity: number;
  status: "normal" | "warning" | "high-usage";
  created_at: string;
  updated_at: string;
}

export interface DbAlert {
  id: string;
  classroom_id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  resolved: boolean;
  created_at: string;
}

export interface DbRecommendation {
  id: string;
  classroom_id: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  recommendation: string;
  estimated_savings: string;
  status: "pending" | "applied" | "dismissed";
  created_at: string;
}

export interface DbReport {
  id: string;
  title: string;
  report_type: "Weekly" | "Monthly" | "Carbon" | "Audit";
  generated_at: string;
  download_url: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      classrooms: {
        Row: DbClassroom;
        Insert: Omit<DbClassroom, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbClassroom, "id">>;
      };
      alerts: {
        Row: DbAlert;
        Insert: Omit<DbAlert, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbAlert, "id">>;
      };
      ai_recommendations: {
        Row: DbRecommendation;
        Insert: Omit<DbRecommendation, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbRecommendation, "id">>;
      };
      reports: {
        Row: DbReport;
        Insert: Omit<DbReport, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbReport, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
