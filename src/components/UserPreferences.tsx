import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { saveUserPreferences, getUserPreferences, type UserPreferences as UserPreferencesType } from "@/lib/api";
import { syncUserSettings } from "@/lib/sync";
import { 
  authenticateWithGoogle, 
  disconnectFromGoogle, 
  isGoogleCalendarConnected, 
  getGoogleCalendars,
  updateSelectedCalendars,
  type GoogleCalendar
} from "@/lib/googleCalendar";

interface UserPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreferencesData = UserPreferencesType;

export function UserPreferences({ open, onOpenChange }: UserPreferencesProps) {
  // Removed useToast in favor of Sonner toast
  const [preferences, setPreferences] = React.useState<PreferencesData>({
    pomodoroFocusLength: 25,
    pomodoroShortBreakLength: 5,
    pomodoroLongBreakLength: 15,
    workStartTime: "09:00",
    workEndTime: "17:00",
    googleCalendarConnected: false,
    selectedCalendars: []
  });
  
  // Google Calendar state
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [availableCalendars, setAvailableCalendars] = React.useState<GoogleCalendar[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = React.useState(false);

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

        // Check if connected to Google Calendar and load calendars if connected
        if (supabasePrefs?.googleCalendarConnected || 
           (chromePrefs.userPreferences && chromePrefs.userPreferences.googleCalendarConnected)) {
          const isConnected = await isGoogleCalendarConnected();
          if (isConnected) {
            loadGoogleCalendars();
          } else {
            // Update connection status if token is invalid but preferences say we're connected
            if (supabasePrefs?.googleCalendarConnected || 
               (chromePrefs.userPreferences && chromePrefs.userPreferences.googleCalendarConnected)) {
              setPreferences(prev => ({ ...prev, googleCalendarConnected: false }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Functie om Google Calendars te laden
  const loadGoogleCalendars = async () => {
    try {
      setIsLoadingCalendars(true);
      const calendars = await getGoogleCalendars();
      
      // Haal de meest recente gebruikersvoorkeuren op
      const supabasePrefs = await getUserPreferences();
      const selectedCalendarIds = supabasePrefs?.selectedCalendars || preferences.selectedCalendars || [];
      
      console.log('Selected calendar IDs:', selectedCalendarIds);
      
      // Markeer geselecteerde agenda's op basis van de gebruikersvoorkeuren
      const markedCalendars = calendars.map(calendar => ({
        ...calendar,
        selected: selectedCalendarIds.includes(calendar.id) || false
      }));
      
      // Update de preferences als we nieuwe selecties hebben gevonden
      if (supabasePrefs?.selectedCalendars && supabasePrefs.selectedCalendars.length > 0) {
        setPreferences(prev => ({
          ...prev,
          selectedCalendars: supabasePrefs.selectedCalendars
        }));
      }
      
      setAvailableCalendars(markedCalendars);
    } catch (error) {
      console.error('Error loading Google Calendars:', error);
      toast.error('Fout bij het laden van agenda\'s', {
        description: 'Er is een probleem opgetreden bij het laden van je Google Agenda\'s.'
      });
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  // Connect met Google Calendar
  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const token = await authenticateWithGoogle();
      
      if (token) {
        // Update preferences met connectie status
        setPreferences(prev => ({ ...prev, googleCalendarConnected: true }));
        
        // Laad beschikbare agenda's
        await loadGoogleCalendars();
        
        toast.success("Verbonden met Google Calendar", {
          description: "Je kunt nu je agenda's selecteren die je wilt synchroniseren."
        });
      } else {
        toast.error("Verbinding mislukt", {
          description: "Er is een probleem opgetreden bij het verbinden met Google Calendar."
        });
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error("Verbinding mislukt", {
        description: "Er is een probleem opgetreden bij het verbinden met Google Calendar."
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Ontkoppel van Google Calendar
  const handleDisconnectGoogle = async () => {
    try {
      const success = await disconnectFromGoogle();
      
      if (success) {
        // Update preferences
        setPreferences(prev => ({ 
          ...prev, 
          googleCalendarConnected: false,
          selectedCalendars: []
        }));
        
        // Wis de lijst met agenda's
        setAvailableCalendars([]);
        
        toast.success("Ontkoppeld van Google Calendar", {
          description: "Je bent niet meer verbonden met Google Calendar."
        });
      } else {
        toast.error("Ontkoppelen mislukt", {
          description: "Er is een probleem opgetreden bij het ontkoppelen van Google Calendar."
        });
      }
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error("Ontkoppelen mislukt", {
        description: "Er is een probleem opgetreden bij het ontkoppelen van Google Calendar."
      });
    }
  };
  
  // Handler voor het selecteren van een agenda
  const handleCalendarSelection = (calendarId: string, isSelected: boolean) => {
    // Update de lijst met beschikbare agenda's
    setAvailableCalendars(prevCalendars => 
      prevCalendars.map(cal => 
        cal.id === calendarId ? { ...cal, selected: isSelected } : cal
      )
    );
    
    // Update de geselecteerde agenda's in de preferences
    let updatedSelectedCalendars = isSelected
      ? [...(preferences.selectedCalendars || []), calendarId]
      : (preferences.selectedCalendars || []).filter(id => id !== calendarId);
    
    // Zorg dat we geen duplicaten hebben door alleen unieke waarden te houden
    updatedSelectedCalendars = [...new Set(updatedSelectedCalendars)];
    console.log('Bijgewerkte agenda selectie (uniek):', updatedSelectedCalendars);
    
    setPreferences(prev => ({
      ...prev,
      selectedCalendars: updatedSelectedCalendars
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving preferences:', preferences);
      
      // Update geselecteerde agenda's op de server indien verbonden met Google Calendar
      if (preferences.googleCalendarConnected && preferences.selectedCalendars) {
        await updateSelectedCalendars(preferences.selectedCalendars);
      }
      
      // First save to chrome.storage
      await chrome.storage.sync.set({ userPreferences: preferences });
      
      // Then sync to Supabase
      await syncUserSettings();
      
      console.log('Preferences saved successfully');
      onOpenChange(false);
      
      // Wacht even voordat we de toast tonen
      setTimeout(() => {
        toast.success("Preferences saved", {
          description: "Your settings have been updated successfully."
        });
      }, 100);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Error", {
        description: "Something went wrong while saving your preferences."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[425px] max-h-[80vh] z-[100] rounded-xl overflow-hidden flex flex-col">
        <DialogHeader className="text-left">
          <DialogTitle>Preferences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto pr-2">
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
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="font-medium">Google Agenda</h3>
            <div className="space-y-4">
              {!preferences.googleCalendarConnected ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Verbind met Google Agenda om je afspraken te synchroniseren met QuarterFocus.
                  </p>
                  <Button 
                    onClick={handleConnectGoogle} 
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Verbinden..." : "Verbind met Google Agenda"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Verbonden met Google Agenda
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDisconnectGoogle}
                    >
                      Ontkoppelen
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Selecteer agenda's om te synchroniseren</Label>
                    {isLoadingCalendars ? (
                      <p className="text-sm text-gray-500">Agenda's laden...</p>
                    ) : availableCalendars.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                        {availableCalendars.map(calendar => (
                          <div key={calendar.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`calendar-${calendar.id}`}
                              checked={calendar.selected}
                              onCheckedChange={(checked) => 
                                handleCalendarSelection(calendar.id, checked === true)}
                              style={{ accentColor: calendar.backgroundColor }}
                            />
                            <Label 
                              htmlFor={`calendar-${calendar.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {calendar.summary}
                              {calendar.primary && " (Primair)"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Geen agenda's gevonden. Ververs de pagina of probeer opnieuw te verbinden.
                      </p>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadGoogleCalendars}
                      disabled={isLoadingCalendars}
                      className="mt-2"
                    >
                      Agenda's verversen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4 mt-auto border-t">
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
