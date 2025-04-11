import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTimeBasedGreeting } from '@/lib/utils';

interface TaskCompletionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
}

// Lijst met positieve berichten
const positiveMessages = [
  "Uitstekend werk! Elke afgeronde taak brengt je een stap dichter bij je doelen.",
  "Geweldig gedaan! Je maakt echt progressie vandaag.",
  "Fantastisch! Je bent goed op weg om al je doelen te bereiken.",
  "Indrukwekkend! Je productiviteit inspireert.",
  "Goed bezig! Deze overwinning brengt je dichter bij je doelen.",
  "Wauw! Je bent echt gefocust en bereikt resultaten.",
  "Super! Je doorzettingsvermogen is bewonderenswaardig.",
  "Bravo! Je bent een stap dichter bij waar je wilt zijn.",
  "Uitstekend! Je bent een voorbeeld van focus en toewijding.",
  "Goed werk! Je kunt trots zijn op wat je hebt bereikt."
];

export const TaskCompletionDialog: React.FC<TaskCompletionDialogProps> = ({
  isOpen,
  onOpenChange,
  taskName
}) => {
  const [message, setMessage] = useState('');
  const [greeting, setGreeting] = useState('');
  const { user } = useAuth();
  
  // Haal de gebruikersnaam op uit de gebruikersgegevens
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  useEffect(() => {
    if (isOpen) {
      // Kies een willekeurig bericht wanneer de dialog opent
      const randomIndex = Math.floor(Math.random() * positiveMessages.length);
      setMessage(positiveMessages[randomIndex]);
      setGreeting(getTimeBasedGreeting());
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[425px] z-[100] rounded-xl overflow-hidden">
        <DialogHeader className="text-left">
          <DialogTitle>🎉 Taak Voltooid!</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            {greeting} {userName}. 
            <p className="mt-2">
              Je hebt zojuist "{taskName}" afgerond.
            </p>
            <p className="mt-2">
              {message}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Bedankt!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
