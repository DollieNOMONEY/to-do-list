// src/components/TaskItem.tsx
// This component represents a single task in the list.
// It consolidates logic from task_manager.js and check_manager.js for an individual task.

'use client';

import React, { useState } from 'react';
import { Task } from '../contexts/TaskContext';
import { useTaskContext } from '../contexts/TaskContext';

interface TaskItemProps {
  task: Task;
  // onEdit: (task: Task) => void; // <-- Removed 'onEdit' from props
  onToggleDone: (taskId: number, isDone: boolean) => void;
}

// <-- Removed 'onEdit' from destructuring here
export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleDone }) => {
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  // Corrected context destructuring: 'toggleSubTaskDone' is the correct name from TaskContext
  const { openTaskDetailModal, toggleSubTaskDone } = useTaskContext();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleDone(task.id, e.target.checked);
  };

  const handleEditClick = () => {
    // This now correctly uses the openTaskDetailModal from the context
    openTaskDetailModal(task);
  };

  const readableDate = task.dueDate;

  const handleSubTaskCheckboxChange = (subtaskId: number, isChecked: boolean) => {
    // Using the correctly named function from context
    toggleSubTaskDone(task.id, subtaskId, isChecked);
  };

  return (
    <div
      className={`container_task margin-sm bg-white p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out ${
        task.isDone ? 'opacity-60 line-through' : ''
      }`}
      id={`task_${task.id}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowExtraInfo(!showExtraInfo)}
          className="toggle-list text-gray-600 hover:text-gray-900 transition-colors"
          data-toggled={showExtraInfo.toString()}
        >
          <i className={`fa-solid ${showExtraInfo ? 'fa-caret-down' : 'fa-caret-right'} fa-xl`}></i>
        </button>
        <input
          type="checkbox"
          id={`todo_${task.id}`}
          className="rounded_checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={task.isDone}
          onChange={handleCheckboxChange}
        />
        <label className="flex-1 bold_text text-lg cursor-pointer" htmlFor={`todo_${task.id}`}>
          {task.taskName}
        </label>
        <div className="right-side-container flex items-center gap-2">
          <p className="bold_text text-gray-500 text-sm">{readableDate}</p>
          <button
            onClick={handleEditClick}
            className="btn_EditTask px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {showExtraInfo && (
        <div className="container_task_extrainformation mt-4 pl-10 space-y-2 is-expanded">
          <p className="text-gray-600">
            <span className="font-semibold">Section:</span> {task.section}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Description:</span> {task.description || 'No description'}
          </p>
          {task.tags && task.tags.length > 0 && (
            <div className="container_task_tags flex flex-wrap gap-2 mt-2">
              {task.tags.map(tag => (
                <div key={tag} className="tag bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {tag}
                </div>
              ))}
            </div>
          )}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="full-width container_subtasks mt-4 space-y-2 is-expanded">
              <p className="font-semibold text-gray-700 mb-2">Subtasks:</p>
              {task.subTasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => handleSubTaskCheckboxChange(subtask.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`${subtask.completed ? 'line-through' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};