import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomAlert } from '@/components/ui/CustomAlert';
import { Goal } from '@/types/goals';
import { TaskStatusId } from '@/types/task';
import { format, parse } from 'date-fns';

const MAX_YEAR_GOALS = 3;
const MAX_QUARTERLY_GOALS = 1;

export const QuarterGoalsView: React.FC = () => {
  const { goals, loading, addGoal, updateGoal } = useGoals();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

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

      setAlert('Goal successfully saved.');
    } catch (error) {
      setAlert('Something went wrong while saving your goal.');
    }
  };

  const handleAddGoal = async (goalTypeId: number) => {
    try {
      if (goalTypeId === 1 && yearGoals.length >= MAX_YEAR_GOALS) {
        setAlert('Je kunt maximaal 3 jaar goals hebben.');
        return;
      }

      if (goalTypeId === 2 && quarterlyGoals.length >= MAX_QUARTERLY_GOALS) {
        setAlert('Je kunt maximaal 1 kwartaal milestone hebben.');
        return;
      }

      const now = new Date();
      const endDate = new Date();
      
      if (goalTypeId === 1) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        endDate.setMonth((currentQuarter + 1) * 3, 0);
      }

      await addGoal({
        goal_type_id: goalTypeId,
        title: "",
        description: "",
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        status_id: TaskStatusId.IN_PROGRESS
      });

      setAlert('Goal aangemaakt. Je kunt deze nu bewerken.');
    } catch (error) {
      setAlert('Er is iets misgegaan bij het aanmaken van je goal.');
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
      {alert && <CustomAlert message={alert} onClose={() => setAlert(null)} />}
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
          <h2 className="text-xl font-semibold mb-4">Quarterly Milestone</h2>
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
                  Click to add your quarterly milestone ({quarterlyGoals.length}/{MAX_QUARTERLY_GOALS})...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
