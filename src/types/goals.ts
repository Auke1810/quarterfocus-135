export type GoalType = {
  id: number;
  name: 'year' | 'quarterly';
  description: string;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  goal_type_id: number;
  goal_type?: GoalType;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status_id: number;
  created_at: string;
  updated_at: string;
};

export type GoalWithType = Goal & {
  goal_type?: GoalType;
};
