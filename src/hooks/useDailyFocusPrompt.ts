import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSupabase } from './useSupabase';

export const useDailyFocusPrompt = (dayFocus: string | null, updateDayFocus: (focus: string) => Promise<void>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkIfShouldShowPrompt = async () => {
      try {
        console.log('Checking if dialog should be shown for user:', user.id);
        
        // Haal de laatste getoonde datum op
        const { supabase } = useSupabase();
        const { data, error } = await supabase
          .from('user_settings')
          .select('last_focus_prompt_date')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching last prompt date:', error);
          return;
        }
        
        const lastPromptDate = data?.last_focus_prompt_date;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        console.log('Last prompt date:', lastPromptDate, 'Today:', today);
        
        // Als er geen datum is, of de datum is niet vandaag, toon dan de prompt
        if (!lastPromptDate || lastPromptDate !== today) {
          console.log('Showing focus prompt dialog - new day detected');
          // Wacht even om de gebruiker eerst de app te laten zien
          setTimeout(() => {
            setIsDialogOpen(true);
          }, 1000);
        } else {
          console.log('Dialog already shown today, not showing again');
        }
      } catch (error) {
        console.error('Error checking prompt date:', error);
      }
    };
    
    // Controleer of de prompt moet worden getoond wanneer de component laadt
    checkIfShouldShowPrompt();
  }, [user]);
  
  // Sla de instelling op wanneer de dialoog gesloten wordt
  useEffect(() => {
    // Als de dialoog gesloten wordt en we hebben een gebruiker
    if (!isDialogOpen && user) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      updateLastPromptDate(today);
    }
  }, [isDialogOpen, user]);
  
  const updateLastPromptDate = async (date: string) => {
    if (!user) return;
    
    try {
      console.log('Updating last prompt date for user:', user.id, 'to date:', date);
      const { supabase } = useSupabase();
      const { data } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      console.log('Existing user settings data:', data);  
      
      if (data) {
        // Update bestaande rij
        console.log('Updating existing settings record');
        const result = await supabase
          .from('user_settings')
          .update({ last_focus_prompt_date: date })
          .eq('user_id', user.id);
          
        console.log('Update result:', result);
      } else {
        // Nieuwe rij invoegen
        console.log('Creating new settings record');
        const result = await supabase
          .from('user_settings')
          .insert([{ 
            user_id: user.id,
            last_focus_prompt_date: date 
          }]);
          
        console.log('Insert result:', result);
      }
    } catch (error) {
      console.error('Error updating last prompt date:', error);
    }
  };
  
  return {
    isDialogOpen,
    setIsDialogOpen,
    onSaveFocus: updateDayFocus
  };
};
