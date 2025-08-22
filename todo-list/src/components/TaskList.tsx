// This component displays a list of tasks.
// It replaces the DOM manipulation in task_manager.js that appended taskDivs to taskList.

'use client';

import React from 'react';
import { Task } from '../contexts/TaskContext'; // Import TaskContext and Task interface
import { TaskItem } from './TaskItem'; // Import individual TaskItem component

interface TaskListProps {
  // tasks: Task[]; // Tasks are now pulled from context
  tasks: Task[];
  onEditTask: (task: Task) => void; // Function to trigger task editing/modal open
  onToggleTaskDone: (taskId: number, isDone: boolean) => void; // Changed to number
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onToggleTaskDone }) => { // Update destructuring here
  // The useTaskContext is still used within MainTaskView, but for this component,
  // we are explicitly passing 'tasks' as a prop.
  // const { filteredTasks } = useTaskContext(); // This line is no longer strictly needed here if tasks are passed down

  return (
    <div className="space-y-4" id="taskList"> {/* Replaces taskList element */}
      {tasks.length === 0 ? ( // Use 'tasks' prop here
        <p className="text-gray-500 text-center">No tasks found for the current filters.</p>
      ) : (
        tasks.map(task => ( // Use 'tasks' prop here
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