export interface Database {
  public: {
    Tables: {
      blueprints: {
        Row: {
          id: string;
          title: string;
          description: string;
          idea: string;
          status: 'ANALYZING' | 'COMPLETED' | 'FAILED';
          market_analysis: any | null;
          technical_blueprint: any | null;
          implementation_plan: any | null;
          code_templates: any[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          idea: string;
          status?: 'ANALYZING' | 'COMPLETED' | 'FAILED';
          market_analysis?: any | null;
          technical_blueprint?: any | null;
          implementation_plan?: any | null;
          code_templates?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          idea?: string;
          status?: 'ANALYZING' | 'COMPLETED' | 'FAILED';
          market_analysis?: any | null;
          technical_blueprint?: any | null;
          implementation_plan?: any | null;
          code_templates?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Blueprint = Database['public']['Tables']['blueprints']['Row'];
export type BlueprintInsert = Database['public']['Tables']['blueprints']['Insert'];
export type BlueprintUpdate = Database['public']['Tables']['blueprints']['Update'];
