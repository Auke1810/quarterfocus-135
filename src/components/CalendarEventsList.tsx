import React, { useEffect, useState } from 'react';
import { getCalendarEvents, GoogleCalendarEvent } from '@/lib/googleCalendar';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import notesIcon from '@/assets/notes.svg';
import notesIconFocus from '@/assets/notes-focus.svg';
import { Skeleton } from './ui/skeleton';

interface CalendarEventsListProps {
  date: Date;
}

export const CalendarEventsList: React.FC<CalendarEventsListProps> = ({ date }) => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Referentie bijhouden van vorige component-instantie
  const componentInstanceRef = React.useRef<string>(
    `calendar-list-${Math.random().toString(36).substring(2, 11)}`
  );
  
  useEffect(() => {
    let isMounted = true;
    console.log(`Component ${componentInstanceRef.current} gemount`);
    
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Debug logging - welke agendaselecities zijn opgeslagen
        const userSettings = await chrome.storage.sync.get(['userPreferences']);
        const selectedCalendars = userSettings?.userPreferences?.selectedCalendars || [];
        
        // Alleen unieke IDs printen (voor debug)
        const uniqueCalendars = [...new Set(selectedCalendars)];
        console.log(`Component ${componentInstanceRef.current} - Geselecteerde agenda's (${uniqueCalendars.length} uniek):`, uniqueCalendars);

        // Create start and end date for the given day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        const calendarEvents = await getCalendarEvents(startDate, endDate);
        
        // Alleen updaten als component nog gemount is
        if (isMounted) {
          console.log(`Component ${componentInstanceRef.current} zet ${calendarEvents.length} agenda-items`);
          
          // Groepeer events op id om duplicaten te verwijderen
          const uniqueEvents = calendarEvents.reduce((acc, current) => {
            const idKey = `${current.id}-${current.calendarId}`;
            if (!acc[idKey]) {
              acc[idKey] = current;
            }
            return acc;
          }, {} as Record<string, GoogleCalendarEvent>);
          
          const uniqueEventsArray = Object.values(uniqueEvents);
          console.log(`Component ${componentInstanceRef.current} - Na deduplicatie: ${uniqueEventsArray.length} unieke items`);
          
          setEvents(uniqueEventsArray);
        }
      } catch (err) {
        console.error(`Component ${componentInstanceRef.current} - Error fetching calendar events:`, err);
        if (isMounted) {
          setError('Er is een probleem opgetreden bij het ophalen van je agenda-items.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();
    
    // Cleanup function om dubbele API calls te voorkomen
    return () => {
      console.log(`Component ${componentInstanceRef.current} unmount`);
      isMounted = false;
    };
  }, [date]);

  // Format time from Date object
  const formatEventTime = (event: GoogleCalendarEvent) => {
    const startTime = format(event.start, 'HH:mm', { locale: nl });
    const endTime = format(event.end, 'HH:mm', { locale: nl });
    return `${startTime} - ${endTime}`;
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        <div className="bg-white p-4 rounded-lg transition-colors shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Appointments</h3>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 mb-2.5">
        <div className="bg-white p-4 rounded-lg transition-colors shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Appointments</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="mt-4 mb-2.5">
        <div className="bg-white p-4 rounded-lg transition-colors shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Appointments</h3>
          </div>
          <div className="p-3 bg-gray-50 text-gray-500 rounded-lg text-sm">Geen agenda-items voor vandaag.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 mb-3.5">
      <div className="bg-white p-4 rounded-lg transition-colors shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Appointments {events.length > 0 ? `(${events.length})` : ''}</h3>
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="p-3 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-gray-800">{event.summary}</h4>
                    <div className="text-xs text-gray-600 mt-1">{formatEventTime(event)}</div>
                  </div>
                  {event.description && (
                    <img 
                      src={expandedEventId === event.id ? notesIconFocus : notesIcon} 
                      alt="Notes" 
                      className="w-4 h-4 mt-1 cursor-pointer" 
                      onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                    />
                  )}
                </div>
                {expandedEventId === event.id && event.description && (
                  <div className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{event.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
