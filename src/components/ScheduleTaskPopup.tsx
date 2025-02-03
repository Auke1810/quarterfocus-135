import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskType } from '@/types/task';

interface ScheduleTaskPopupProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (date: Date, taskType: TaskType) => void;
}

export const ScheduleTaskPopup: React.FC<ScheduleTaskPopupProps> = ({
  open,
  onClose,
  onSchedule,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [selectedType, setSelectedType] = React.useState<TaskType>('small');

  const handleSchedule = () => {
    if (selectedDate) {
      onSchedule(selectedDate, selectedType);
      onClose();
    }
  };

  // Calculate date range for the next week
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[320px]">
        <DialogHeader>
          <DialogTitle>Plan taak in</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              fromDate={today}
              toDate={nextWeek}
              initialFocus
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Select
              value={selectedType}
              onValueChange={(value: TaskType) => setSelectedType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer taak type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="big">Groot (1)</SelectItem>
                <SelectItem value="medium">Medium (3)</SelectItem>
                <SelectItem value="small">Klein (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button onClick={handleSchedule} disabled={!selectedDate}>
              Inplannen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
