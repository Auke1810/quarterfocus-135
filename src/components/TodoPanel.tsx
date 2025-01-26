import React from 'react';
import { TodoList } from './TodoList';

const TodoPanel = () => {
  return (
    <div className="h-full flex flex-col">
      <TodoList />
    </div>
  );
};

export default TodoPanel;
