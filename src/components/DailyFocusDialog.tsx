import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { getTimeBasedGreeting } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

interface DailyFocusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveFocus: (focus: string) => Promise<void>;
  defaultFocus: string;
}

export const DailyFocusDialog: React.FC<DailyFocusDialogProps> = ({
  isOpen,
  onOpenChange,
  onSaveFocus,
  defaultFocus,
}) => {
  const [focusText, setFocusText] = useState(defaultFocus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [greeting, setGreeting] = useState('');
  const { user } = useAuth();
  
  // Haal de gebruikersnaam op uit de gebruikersgegevens
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const handleSubmit = async () => {
    if (focusText.trim()) {
      setIsSubmitting(true);
      try {
        await onSaveFocus(focusText.trim());
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving daily focus:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  // Update de begroeting wanneer de component wordt geladen
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[425px] z-[100] rounded-xl overflow-hidden">
        <DialogHeader className="text-left">
          <DialogTitle>Welkom bij QuarterFocus</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            {greeting} {userName}. Wat is je belangrijkste focus voor vandaag? Wie zou je willen zijn en wat zou je willen bereiken?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            autoFocus
            value={focusText}
            onChange={(e) => setFocusText(e.target.value)}
            placeholder="Bijv. Afronden van het projectvoorstel"
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
