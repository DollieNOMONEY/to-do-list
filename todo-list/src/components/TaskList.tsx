// This component displays a list of tasks.
// It replaces the DOM manipulation in task_manager.js that appended taskDivs to taskList.

'use client';

import React from 'react';
import { useTaskContext } from '../contexts/TaskContext'; // Import TaskContext
import { TaskItem } from './TaskItem'; // Import individual TaskItem component

interface TaskListProps {
  // tasks: Task[]; // Tasks are now pulled from context
  onEditTask: (task: any) => void; // Function to trigger task editing/modal open
  onToggleTaskDone: (taskId: number, isDone: boolean) => void; // Changed to number
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask, onToggleTaskDone }) => {
  const { filteredTasks } = useTaskContext(); // Get filtered tasks from context

  return (
    <div className="space-y-4" id="taskList"> {/* Replaces taskList element */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks found for the current filters.</p>
      ) : (
        filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onToggleDone={onToggleTaskDone}
          />
        ))
      )}
    </div>
  );
};