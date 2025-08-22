// src/components/TaskList.tsx
// This component displays a list of tasks.
// It replaces the DOM manipulation in task_manager.js that appended taskDivs to taskList.

'use client';

import React from 'react';
import { Task } from '../contexts/TaskContext'; // Import Task interface
import { TaskItem } from './TaskItem'; // Import individual TaskItem component

interface TaskListProps {
  tasks: Task[]; // Now correctly declared as a prop
  onEditTask: (task: Task) => void; // Type changed from 'any' to 'Task'
  onToggleTaskDone: (taskId: number, isDone: boolean) => void; // Changed to number
}

// Destructure 'onToggleTaskDone' to match the interface property name
export const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onToggleTaskDone }) => {
  // Removed `useTaskContext()` here as `tasks`, `onEditTask`, and `onToggleTaskDone`
  // are now all passed in as props, making this component more reusable and less coupled.
  // const { filteredTasks } = useTaskContext();

  return (
    <div className="space-y-4" id="taskList"> {/* Replaces taskList element */}
      {tasks.length === 0 ? ( // Use 'tasks' prop here
        <p className="text-gray-500 text-center">No tasks found for the current filters.</p>
      ) : (
        tasks.map(task => ( // Use 'tasks' prop here
          <TaskItem
            key={task.id}
            task={task}
            onEditTask={onEditTask} // Pass onEditTask to TaskItem
            onToggleTaskDone={onToggleTaskDone} // Pass onToggleTaskDone to TaskItem
          />
        ))
      )}
    </div>
  );
};