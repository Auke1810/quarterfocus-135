import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Goal } from '@/types/goals';
import { TaskStatusId } from '@/types/task';
import { format, parse } from 'date-fns';

const MAX_YEAR_GOALS = 3;
const MAX_QUARTERLY_GOALS = 3;

export const QuarterGoalsView: React.FC = () => {
  const { goals, loading, addGoal, updateGoal } = useGoals();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  // Removed alert state in favor of toast

  const yearGoals = goals.filter(goal => goal.goal_type.name === 'year');
  const quarterlyGoals = goals.filter(goal => goal.goal_type.name === 'quarterly');

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditDueDate(format(new Date(goal.end_date), 'yyyy-MM-dd'));
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal(editingGoal.id, {
        title: editTitle,
        description: editDescription,
        end_date: new Date(editDueDate).toISOString(),
        status_id: editingGoal.status_id
      });

      setEditingGoal(null);
      setEditTitle('');
      setEditDescription('');
      setEditDueDate('');

      toast.success('Goal successfully saved.');
    } catch (error) {
      toast.error('Something went wrong while saving your goal.');
    }
  };

  // Hulpfunctie om het huidige kwartaal te bepalen (1-4)
  const getCurrentQuarter = (): number => {
    const month = new Date().getMonth();
    return Math.floor(month / 3) + 1; // 0-11 maanden naar 1-4 kwartalen
  };

  // Hulpfunctie om de einddatum van een kwartaal te berekenen
  const getQuarterEndDate = (year: number, quarter: number): Date => {
    const endMonth = quarter * 3 - 1; // Kwartaal 1 -> maand 2 (maart), etc.
    const endDate = new Date(year, endMonth, 0);
    // Laatste dag van de maand
    endDate.setDate(new Date(year, endMonth + 1, 0).getDate());
    return endDate;
  };

  const handleAddGoal = async (goalTypeId: number) => {
    try {
      if (goalTypeId === 1 && yearGoals.length >= MAX_YEAR_GOALS) {
        toast.warning('Je kunt maximaal 3 jaar goals hebben.');
        return;
      }

      if (goalTypeId === 2 && quarterlyGoals.length >= MAX_QUARTERLY_GOALS) {
        toast.warning(`Je kunt maximaal ${MAX_QUARTERLY_GOALS} kwartaal milestones hebben.`);
        return;
      }

      const now = new Date();
      let endDate = new Date();
      
      if (goalTypeId === 1) {
        // Voor jaardoelen: einde van het huidige jaar
        endDate = new Date(now.getFullYear(), 11, 31); // 31 december
      } else {
        // Voor kwartaaldoelen: einde van het huidige kwartaal
        const currentYear = now.getFullYear();
        const currentQuarter = getCurrentQuarter();
        
        // Als er al kwartaaldoelen zijn, stel het volgende kwartaal voor
        if (quarterlyGoals.length > 0) {
          const nextQuarter = (currentQuarter % 4) + 1;
          const yearOffset = nextQuarter <= currentQuarter ? 1 : 0;
          endDate = getQuarterEndDate(currentYear + yearOffset, nextQuarter);
        } else {
          endDate = getQuarterEndDate(currentYear, currentQuarter);
        }
      }

      await addGoal({
        goal_type_id: goalTypeId,
        title: "",
        description: "",
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        status_id: TaskStatusId.IN_PROGRESS
      });

      toast.success('Goal aangemaakt. Je kunt deze nu bewerken.');
    } catch (error) {
      toast.error('Er is iets misgegaan bij het aanmaken van je goal.');
    }
  };

  const renderGoalEditor = (goal: Goal, index: number, isYear: boolean) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="font-medium">{index + 1}.</span>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder={isYear ? "Enter your goal..." : "Enter your milestone..."}
          className="flex-1"
        />
      </div>
      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Add a description..."
        className="w-full p-2 border rounded-lg"
        rows={3}
      />
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Due date:</span>
        <Input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setEditTitle('');
            setEditDescription('');
            setEditDueDate('');
          }}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSaveGoal}
        >
          Save
        </Button>
      </div>
    </div>
  );

  const renderGoalDisplay = (goal: Goal, index: number) => (
    <div
      onClick={() => handleEditGoal(goal)}
      className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
    >
      <span className="font-medium">{index + 1}.</span>
      <div className="flex-1">
        {goal.title ? (
          <>
            <p className="font-medium">{goal.title}</p>
            {goal.description && (
              <p className="text-gray-600 mt-1">{goal.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Due: {format(new Date(goal.end_date), 'MMMM d, yyyy')}
            </p>
          </>
        ) : (
          <p className="text-gray-400 italic">Click to enter your goal...</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quarter Goals</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Alert is now handled by Sonner toast */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Year Goals</h2>
          <div className="space-y-4">
            {yearGoals.map((goal, index) => (
              <div key={goal.id} className="group">
                {editingGoal?.id === goal.id ? (
                  renderGoalEditor(goal, index, true)
                ) : (
                  renderGoalDisplay(goal, index)
                )}
              </div>
            ))}
            {yearGoals.length < MAX_YEAR_GOALS && (
              <div
                onClick={() => handleAddGoal(1)}
                className="p-4 rounded-lg cursor-pointer hover:bg-gray-50 text-center"
              >
                <p className="text-gray-400 italic">
                  Click to add a year goal ({yearGoals.length}/{MAX_YEAR_GOALS})...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quarterly Milestones</h2>
          <div className="space-y-4">
            {quarterlyGoals.map((goal, index) => (
              <div key={goal.id} className="group">
                {editingGoal?.id === goal.id ? (
                  renderGoalEditor(goal, index, false)
                ) : (
                  renderGoalDisplay(goal, index)
                )}
              </div>
            ))}
            {quarterlyGoals.length < MAX_QUARTERLY_GOALS && (
              <div
                onClick={() => handleAddGoal(2)}
                className="p-4 rounded-lg cursor-pointer hover:bg-gray-50 text-center"
              >
                <p className="text-gray-400 italic">
                  Click to add a quarterly milestone ({quarterlyGoals.length}/{MAX_QUARTERLY_GOALS})...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
