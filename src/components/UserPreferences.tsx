import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { saveUserPreferences, getUserPreferences, type UserPreferences as UserPreferencesType } from "@/lib/api";
import { syncUserSettings } from "@/lib/sync";

interface UserPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreferencesData = UserPreferencesType;

export function UserPreferences({ open, onOpenChange }: UserPreferencesProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = React.useState<PreferencesData>({
    pomodoroFocusLength: 25,
    pomodoroShortBreakLength: 5,
    pomodoroLongBreakLength: 15,
    workStartTime: "09:00",
    workEndTime: "17:00"
  });

  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load preferences from chrome.storage.sync
        console.log('Loading preferences from chrome.storage...');
        const chromePrefs = await chrome.storage.sync.get(['userPreferences']);
        
        // Load preferences from Supabase
        console.log('Loading preferences from Supabase...');
        const supabasePrefs = await getUserPreferences();
        
        // Use Supabase preferences if available, otherwise use chrome.storage
        if (supabasePrefs) {
          console.log('Using preferences from Supabase:', supabasePrefs);
          setPreferences(supabasePrefs);
          // Update chrome.storage with Supabase preferences
          await chrome.storage.sync.set({ userPreferences: supabasePrefs });
        } else if (chromePrefs.userPreferences) {
          console.log('Using preferences from chrome.storage:', chromePrefs.userPreferences);
          setPreferences(chromePrefs.userPreferences);
          // Save chrome.storage preferences to Supabase
          await saveUserPreferences(chromePrefs.userPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      console.log('Saving preferences:', preferences);
      
      // First save to chrome.storage
      await chrome.storage.sync.set({ userPreferences: preferences });
      
      // Then sync to Supabase
      await syncUserSettings();
      
      console.log('Preferences saved successfully');
      onOpenChange(false);
      
      // Wacht even voordat we de toast tonen
      setTimeout(() => {
        toast({
          title: "Preferences saved",
          description: "Your settings have been updated successfully."
        });
      }, 100);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Something went wrong while saving your preferences.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-[425px] z-[100]">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium">Pomodoro Timer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusLength">Focus time (minutes)</Label>
                <Input
                  id="focusLength"
                  type="number"
                  value={preferences.pomodoroFocusLength}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    pomodoroFocusLength: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreak">Short break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  value={preferences.pomodoroShortBreakLength}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    pomodoroShortBreakLength: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreak">Long break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  value={preferences.pomodoroLongBreakLength}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    pomodoroLongBreakLength: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Werktijden</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={preferences.workStartTime}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workStartTime: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={preferences.workEndTime}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    workEndTime: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
