import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Goal, GoalType, GoalWithType } from '@/types/goals';

export const useGoals = () => {
  const { supabase } = useSupabase();
  const [goals, setGoals] = useState<GoalWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Haal alle doelen op voor de huidige gebruiker
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          goal_type:goal_types!goal_type_id(*)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;

      setGoals(data as unknown as GoalWithType[]);
    } catch (e) {
      setError(e as Error);
      console.error('Error fetching goals:', e);
    } finally {
      setLoading(false);
    }
  };

  // Voeg een nieuw doel toe
  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: user.id }])
        .select(`
          *,
          goal_type:goal_types!goal_type_id(*)
        `)
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data as unknown as GoalWithType]);
      return data;
    } catch (e) {
      console.error('Error adding goal:', e);
      throw e;
    }
  };

  // Update een bestaand doel
  const updateGoal = async (
    id: string,
    updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          goal_type:goal_types!goal_type_id(*)
        `)
        .single();

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal => (goal.id === id ? (data as unknown as GoalWithType) : goal))
      );
      return data;
    } catch (e) {
      console.error('Error updating goal:', e);
      throw e;
    }
  };

  // Verwijder een doel
  const deleteGoal = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (e) {
      console.error('Error deleting goal:', e);
      throw e;
    }
  };

  // Haal alle goal types op
  const fetchGoalTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_types')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      return data as GoalType[];
    } catch (e) {
      console.error('Error fetching goal types:', e);
      throw e;
    }
  };

  // Laad doelen wanneer de hook wordt gemount
  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    fetchGoalTypes,
  };
};
