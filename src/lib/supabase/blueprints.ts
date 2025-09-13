import { supabase } from './client';
import { supabaseServer } from './server';
import { Blueprint, BlueprintInsert, BlueprintUpdate } from './types';

export class BlueprintService {
  // Get all blueprints
  static async getAll(): Promise<Blueprint[]> {
    const { data, error } = await supabaseServer
      .from('blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blueprints:', error);
      throw new Error(`Failed to fetch blueprints: ${error.message}`);
    }

    return data || [];
  }

  // Get a single blueprint by ID
  static async getById(id: string): Promise<Blueprint | null> {
    const { data, error } = await supabaseServer
      .from('blueprints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching blueprint:', error);
      throw new Error(`Failed to fetch blueprint: ${error.message}`);
    }

    return data;
  }

  // Create a new blueprint
  static async create(blueprint: BlueprintInsert): Promise<Blueprint> {
    try {
      console.log('Creating blueprint with data:', blueprint);
      
      // Use server client to bypass RLS
      const { data, error } = await supabaseServer
        .from('blueprints')
        .insert(blueprint)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating blueprint:', error);
        throw new Error(`Failed to create blueprint: ${error.message}`);
      }

      console.log('Blueprint created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in BlueprintService.create:', error);
      throw error;
    }
  }

  // Update a blueprint
  static async update(id: string, updates: BlueprintUpdate): Promise<Blueprint> {
    const { data, error } = await supabaseServer
      .from('blueprints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blueprint:', error);
      throw new Error(`Failed to update blueprint: ${error.message}`);
    }

    return data;
  }

  // Delete a blueprint
  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseServer
      .from('blueprints')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blueprint:', error);
      throw new Error(`Failed to delete blueprint: ${error.message}`);
    }

    return true;
  }
}
