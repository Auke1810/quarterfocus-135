import { supabase } from "./supabase";

/**
 * Interface voor een Google Calendar object
 */
export interface GoogleCalendar {
  id: string;
  summary: string;
  description: string | null;
  primary: boolean;
  backgroundColor: string;
  selected: boolean;
}

/**
 * Interface voor een Google Calendar event
 */
export interface GoogleCalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  description: string | null;
  start: Date;
  end: Date;
  location: string | null;
}

/**
 * Authenticatie bij Google met oauth
 * @returns Access token voor Google Calendar API
 */
export async function authenticateWithGoogle(): Promise<string | null> {
  try {
    // Gebruik chrome.identity om te authenticeren met Google
    const authToken = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('OAuth error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    // Sla het token op in chrome.storage voor persistent gebruik tussen sessies
    await chrome.storage.local.set({ 'googleAuthToken': authToken });
    
    // Update de gebruikersvoorkeuren
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_settings")
        .update({ google_calendar_connected: true })
        .eq("user_id", user.id);
    }

    return authToken;
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    return null;
  }
}

/**
 * Verbreek de connectie met Google Calendar
 */
export async function disconnectFromGoogle(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(['googleAuthToken']);
    const authToken = result.googleAuthToken;
    
    if (authToken) {
      // Revoke access
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${authToken}`, {
        method: 'GET'
      });
      
      await chrome.storage.local.remove('googleAuthToken');
    }
    
    // Update de gebruikersvoorkeuren
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_settings")
        .update({ 
          google_calendar_connected: false,
          selected_calendars: []
        })
        .eq("user_id", user.id);
    }

    return true;
  } catch (error) {
    console.error('Error disconnecting from Google:', error);
    return false;
  }
}

/**
 * Controleer of we zijn geconnect met Google Calendar
 */
export async function isGoogleCalendarConnected(): Promise<boolean> {
  try {
    // Controleer eerst of we een token hebben
    const result = await chrome.storage.local.get(['googleAuthToken']);
    const authToken = result.googleAuthToken;
    if (!authToken) return false;
    
    // Test het token met een simpele API call
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      // Token is ongeldig, verwijder het
      await chrome.storage.local.remove('googleAuthToken');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    return false;
  }
}

/**
 * Haal alle beschikbare agenda's op van Google Calendar
 * @returns Array van Google Calendar objecten
 */
export async function getGoogleCalendars(): Promise<GoogleCalendar[]> {
  try {
    const result = await chrome.storage.local.get(['googleAuthToken']);
    const authToken = result.googleAuthToken;
    if (!authToken) {
      throw new Error('Not authenticated with Google');
    }
    
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Converteer het response format naar ons eigen format
    const calendars: GoogleCalendar[] = data.items.map((item: any) => ({
      id: item.id,
      summary: item.summary,
      description: item.description || null,
      primary: item.primary || false,
      backgroundColor: item.backgroundColor || '#4285F4',
      selected: item.selected || false
    }));
    
    return calendars;
  } catch (error) {
    console.error('Error fetching Google Calendars:', error);
    return [];
  }
}

/**
 * Update de geselecteerde agenda's in de gebruikersvoorkeuren
 * @param calendarIds Array van geselecteerde agenda IDs
 */
export async function updateSelectedCalendars(calendarIds: string[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from("user_settings")
      .update({ selected_calendars: calendarIds })
      .eq("user_id", user.id);
      
    if (error) throw error;
    
    // Ook updaten in chrome.storage voor snellere toegang
    await chrome.storage.sync.get(['userPreferences'], async (result) => {
      if (result.userPreferences) {
        const updatedPrefs = {
          ...result.userPreferences,
          selectedCalendars: calendarIds
        };
        await chrome.storage.sync.set({ userPreferences: updatedPrefs });
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating selected calendars:', error);
    return false;
  }
}

/**
 * Haal events op van de geselecteerde agenda's
 * @param startDate Begin datum voor events
 * @param endDate Eind datum voor events
 * @returns Array van Google Calendar events
 */
export async function getCalendarEvents(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
  try {
    console.log('getCalendarEvents aangeroepen voor', startDate, 'tot', endDate);
    
    const result = await chrome.storage.local.get(['googleAuthToken']);
    const authToken = result.googleAuthToken;
    if (!authToken) {
      console.log('Geen Google Auth token gevonden');
      throw new Error('Not authenticated with Google');
    }
    
    // Haal geselecteerde agenda's op uit chrome.storage EN Supabase voor consistentie
    // Eerst vanuit chrome.storage voor snelle toegang
    const chromePrefs = await chrome.storage.sync.get(['userPreferences']);
    let selectedCalendars: string[] = [];
    
    if (chromePrefs.userPreferences?.selectedCalendars) {
      console.log('Geselecteerde agenda\'s uit chrome.storage:', chromePrefs.userPreferences.selectedCalendars);
      selectedCalendars = chromePrefs.userPreferences.selectedCalendars;
    }
    
    // Als er geen geselecteerde agenda's zijn, controleer dan Supabase
    if (selectedCalendars.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_settings")
        .select("selected_calendars")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error('Error fetching selected calendars from Supabase:', error);
        return [];
      }
      
      if (data && data.selected_calendars && data.selected_calendars.length > 0) {
        console.log('Geselecteerde agenda\'s uit Supabase:', data.selected_calendars);
        selectedCalendars = data.selected_calendars;
        
        // Update chrome.storage voor toekomstige calls
        if (chromePrefs.userPreferences) {
          // Zorg dat we unieke waarden hebben om duplicaten te voorkomen
          const uniqueCalendars = [...new Set(data.selected_calendars)];
          console.log('Opschonen van geselecteerde agenda\'s (remove duplicates):', uniqueCalendars);
          
          await chrome.storage.sync.set({
            userPreferences: {
              ...chromePrefs.userPreferences,
              selectedCalendars: uniqueCalendars
            }
          });
          
          // Ook updaten in Supabase als we hier duplicaten hebben verwijderd
          if (uniqueCalendars.length !== data.selected_calendars.length) {
            console.log('Duplicaten gevonden en verwijderd, update Supabase...');
            const { error: updateError } = await supabase
              .from('user_settings')
              .update({ selected_calendars: uniqueCalendars })
              .eq('user_id', user.id);
              
            if (updateError) {
              console.error('Error bij updaten user_settings met unieke agenda selecties:', updateError);
            }
          }
        }
      }
    }
    
    // Als er nog steeds geen geselecteerde agenda's zijn, return leeg
    if (selectedCalendars.length === 0) {
      console.log('Geen geselecteerde agenda\'s gevonden');
      return [];
    }
    
    // Formatteer de datums voor de API
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();
    
    // Haal events op voor elke geselecteerde agenda
    const allEvents: GoogleCalendarEvent[] = [];
    
    for (const calendarId of selectedCalendars) {
      const encodedCalendarId = encodeURIComponent(calendarId);
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch events for calendar ${calendarId}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      // Converteer het response format naar ons eigen format
      const events: GoogleCalendarEvent[] = data.items
        .filter((item: any) => item.status !== 'cancelled')
        .map((item: any) => ({
          id: item.id,
          calendarId,
          summary: item.summary || '(No title)',
          description: item.description || null,
          start: new Date(item.start.dateTime || item.start.date),
          end: new Date(item.end.dateTime || item.end.date),
          location: item.location || null
        }));
      
      allEvents.push(...events);
    }
    
    // Sorteer alle events op startdatum
    return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
