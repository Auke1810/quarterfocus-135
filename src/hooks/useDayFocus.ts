import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/components/auth/AuthProvider';

export const useDayFocus = () => {
  const { user } = useAuth();
  const [dayFocus, setDayFocus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDayFocus();
    }
  }, [user]);

  const fetchDayFocus = async () => {
    try {
      const { supabase } = useSupabase();
      const { data, error } = await supabase
        .from('user_settings')
        .select('day_focus')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setDayFocus((data?.day_focus as string) || null);
    } catch (error) {
      console.error('Error fetching day focus:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDayFocus = async (newFocus: string) => {
    if (!user) return;

    try {
      // Eerst kijken of er al een instelling bestaat
      const { supabase } = useSupabase();
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select()
        .eq('user_id', user.id)
        .single();

      if (existingSettings) {
        // Update bestaande instelling
        const { error } = await supabase
          .from('user_settings')
          .update({ day_focus: newFocus })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Maak nieuwe instelling
        const { error } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id, day_focus: newFocus });

        if (error) throw error;
      }

      setDayFocus(newFocus);
    } catch (error) {
      console.error('Error updating day focus:', error);
    }
  };

  return {
    dayFocus,
    loading,
    updateDayFocus,
  };
};
