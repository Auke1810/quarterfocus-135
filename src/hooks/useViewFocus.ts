import { useState, useEffect } from 'react';
import { ViewType } from '@/types/task';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSupabase } from '@/hooks/useSupabase';

export const useViewFocus = (viewType: ViewType) => {
  const [focus, setFocus] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchFocus = async () => {
      const { supabase } = useSupabase();
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching focus:', error);
        return;
      }

      const focusField = viewType === 'focus' 
        ? 'day_focus' 
        : viewType === 'tomorrow'
        ? 'tomorrow_focus'
        : 'week_focus';

      setFocus((data?.[focusField] as string) || '');
    };

    fetchFocus();
  }, [user, viewType]);

  const updateFocus = async (newFocus: string): Promise<void> => {
    if (!user) return;

    const focusField = viewType === 'focus' 
      ? 'day_focus' 
      : viewType === 'tomorrow'
      ? 'tomorrow_focus'
      : 'week_focus';

    // Eerst checken of er al een rij bestaat
    const { supabase } = useSupabase();
    const { data } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let error;

    if (data) {
      // Update bestaande rij
      const result = await supabase
        .from('user_settings')
        .update({ [focusField]: newFocus })
        .eq('user_id', user.id);
      error = result.error;
    } else {
      // Nieuwe rij invoegen
      const result = await supabase
        .from('user_settings')
        .insert([{ 
          user_id: user.id,
          [focusField]: newFocus,
        }]);
      error = result.error;
    }

    if (error) {
      console.error('Error updating focus:', error);
      return;
    }

    setFocus(newFocus);
  };

  return { focus, updateFocus };
};
