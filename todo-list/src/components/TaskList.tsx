// This component displays a list of tasks.
// It replaces the DOM manipulation in task_manager.js that appended taskDivs to taskList.

'use client';

'use client';

import React from 'react';
import { Task } from '../contexts/TaskContext'; // Import Task interface
import { TaskItem } from './TaskItem'; // Import individual TaskItem component

interface TaskListProps {
  tasks: Task[]; // This prop is now correctly passed from app/page.tsx
  onEditTask: (task: Task) => void; // Function to trigger task editing/modal open
  onToggleTaskDone: (taskId: number, isDone: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onToggleTaskDone }) => {
  // We remove the useTaskContext() call here because `tasks` is received as a prop.
  // const { filteredTasks } = useTaskContext(); 

  return (
    <div className="space-y-4" id="taskList">
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks found for the current filters.</p>
      ) : (
        tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEditTask} // Pass onEditTask as 'onEdit' prop
            onToggleDone={onToggleTaskDone} // Pass onToggleTaskDone as 'onToggleDone' prop
          />
        ))
      )}
    </div>
  );
};
