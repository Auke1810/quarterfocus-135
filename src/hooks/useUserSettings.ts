import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/components/auth/AuthProvider';

export interface UserSettings {
  id?: string;
  user_id: string;
  vision?: string;
  'core-value-1'?: string;
  'core-value-2'?: string;
  'core-value-3'?: string;
  created_at?: string;
  updated_at?: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        return;
      }

      setSettings(data as unknown as UserSettings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVision = async (vision: string) => {
    if (!user) return;

    try {
      const updatedSettings = {
        user_id: user.id,
        vision,
        updated_at: new Date().toISOString(),
      };

      if (!settings) {
        const { error } = await supabase
          .from('user_settings')
          .insert([updatedSettings]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .update(updatedSettings)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
      }));
    } catch (error) {
      console.error('Error updating vision:', error);
      throw error;
    }
  };

  const updateCoreValues = async (values: { [key: string]: string }) => {
    if (!user) return;

    try {
      const updatedSettings = {
        user_id: user.id,
        ...values,
        updated_at: new Date().toISOString(),
      };

      if (!settings) {
        const { error } = await supabase
          .from('user_settings')
          .insert([updatedSettings]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .update(updatedSettings)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
      }));
    } catch (error) {
      console.error('Error updating core values:', error);
      throw error;
    }
  };

  const updateCoreValue = async (key: 'core-value-1' | 'core-value-2' | 'core-value-3', value: string) => {
    if (!user) return;

    try {
      const updatedSettings = {
        user_id: user.id,
        [key]: value,
        updated_at: new Date().toISOString(),
      };

      if (!settings) {
        const { error } = await supabase
          .from('user_settings')
          .insert([updatedSettings]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .update(updatedSettings)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
      }));
    } catch (error) {
      console.error('Error updating core value:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateVision,
    updateCoreValues,
    updateCoreValue,
  };
}
