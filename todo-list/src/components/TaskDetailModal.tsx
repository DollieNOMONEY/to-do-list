// This component acts as the modal for detailed task information and editing.
// It replaces logic from task_manager.js for editTask and updateTask, and subtask_manager.js.
// It now merges the UI from your WindowTaskInformation.tsx.

'use client';

import React, { useState, useEffect } from 'react';
import { useTaskContext, Task, SubTask } from '../contexts/TaskContext';
// Removed getISOWeekDay as we are now strictly using YYYY-MM-DD for dueDate

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  createNewSubTask: (taskId: number, subTaskTitle: string) => Promise<void>;
  deleteSubTask: (taskId: number, subTaskId: number) => Promise<void>;
  updateSubTask: (taskId: number, subTaskId: number, newTitle: string, completed: boolean) => Promise<void>;
  onToggleSubTaskDone: (taskId: number, subTaskId: number, completed: boolean) => Promise<void>;
  sections: string[];
  tags: string[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  createNewSubTask,
  deleteSubTask,
  updateSubTask,
  onToggleSubTaskDone,
  sections,
  tags,
}) => {
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTask(task); // Sync internal state with prop changes
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tags") { // Handle multiple select for tags
      const selectedOptions = Array.from((e.target as HTMLSelectElement).options)
        .filter(option => option.selected)
        .map(option => option.value);
      setCurrentTask(prev => ({ ...prev!, tags: selectedOptions }));
    } else if (name === "section") {
      setCurrentTask(prev => ({ ...prev!, section: value }));
    } else if (name === "taskName") {
      setCurrentTask(prev => ({ ...prev!, taskName: value }));
    } else if (name === "description") {
      setCurrentTask(prev => ({ ...prev!, description: value }));
    } else if (name === "dueDate") {
        setCurrentTask(prev => ({ ...prev!, dueDate: value }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(currentTask);
    onClose();
  };

  const handleDelete = async () => {
    // Custom modal replacement for window.confirm
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (confirmed) {
      await onDelete(task.id);
      onClose();
    }
  };

  const handleCreateNewSubTask = async () => {
    await createNewSubTask(task.id, 'New Subtask');
  };

  const handleSubTaskEditClick = (subtask: SubTask) => {
    setEditingSubtaskId(subtask.id);
  };

  const handleSubTaskInputBlur = async (subtaskId: number, newTitle: string) => {
    await updateSubTask(task.id, subtaskId, newTitle, currentTask.subTasks.find(st => st.id === subtaskId)?.completed || false);
    setEditingSubtaskId(null);
  };

  const handleSubTaskCheckboxChange = async (subtaskId: number, isChecked: boolean) => {
    await onToggleSubTaskDone(task.id, subtaskId, isChecked);
  };

  const handleSubTaskDelete = async (subtaskId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this subtask?');
    if (confirmed) {
      await deleteSubTask(task.id, subtaskId);
    }
  };

  return (
    // This outer div provides the basic modal overlay and centering.
    // We need some minimal styling here for it to act as a proper modal overlay.
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(107, 114, 128, 0.5)', // Gray background with transparency
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50 // Ensure it's above other content
    }}>
      <form id="window__taskinformation" onSubmit={handleUpdate} style={{padding: '1rem'}}>
        <div className="window__navigation__responsive">
          <h1 className="margin-xs">Task</h1>
          <button
            aria-label="Close Task Info"
            id="btn_CloseTaskInfo"
            type="button"
            className="mobile responsive__button margin_auto_adjust"
            onClick={onClose}
          >
            <i className="fa-solid fa-x fa-2xl"></i>
          </button>
        </div>

        <input
          name="taskName" // Changed from taskTitle
          id="window__taskinformation__input_title"
          type="text"
          placeholder="Title"
          className="margin-sm"
          value={currentTask.taskName}
          onChange={handleChange}
          required
        />
        <textarea
          name="description" // Changed from taskDescription
          id="window__taskinformation__input_desc"
          placeholder="Description"
          className="margin-sm"
          value={currentTask.description}
          onChange={handleChange}
          rows={3}
        ></textarea>

        <div className="organization margin-sm">
          <label htmlFor="sections">List</label> {/* Changed htmlFor */}
          <select
            name="section" // Changed from taskSection
            id="taskSections"
            value={currentTask.section}
            onChange={handleChange}
          >
            {sections.filter(s => s !== 'All').map(section => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        <div className="organization margin-sm">
          <label htmlFor="dueDate">Due Date</label> {/* Changed htmlFor */}
          <input
            name="dueDate" // Changed from taskDueDate
            id="window__taskinformation__input_duedate"
            type="date" // Changed to type="date"
            placeholder="YYYY-MM-DD"
            value={currentTask.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="organization margin-sm">
          <label htmlFor="tags">Tag</label> {/* Changed htmlFor */}
          <select
            name="tags" // Changed from tagSection
            size={3}
            id="window__taskinformation__input_tags"
            multiple
            value={currentTask.tags}
            onChange={handleChange}
          >
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <h2>Subtasks</h2>
        <button
          id="btn_NewSubTask"
          type="button"
          className="margin-sm"
          onClick={handleCreateNewSubTask}
        >
          + New Subtask
        </button>
        <div id="window__taskinformation__subTaskList">
          {currentTask.subTasks && currentTask.subTasks.map(subtask => (
            <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={e => handleSubTaskCheckboxChange(subtask.id, e.target.checked)}
              />
              {editingSubtaskId === subtask.id ? (
                <input
                  type="text"
                  value={subtask.title}
                  onChange={e =>
                    setCurrentTask(prev => ({
                      ...prev!,
                      subTasks: prev!.subTasks.map(st =>
                        st.id === subtask.id ? { ...st, title: e.target.value } : st
                      ),
                    }))
                  }
                  onBlur={e => handleSubTaskInputBlur(subtask.id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') {
                      setEditingSubtaskId(null); // Cancel edit
                      setCurrentTask(task); // Revert
                    }
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => handleSubTaskEditClick(subtask)}
                  className={`${subtask.completed ? 'line-through' : ''}`}
                >
                  {subtask.title}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSubTaskEditClick(subtask)}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleSubTaskDelete(subtask.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div id="window__taskinformation__buttons">
          <button
            type="button"
            id="btn_DeleteTask"
            onClick={handleDelete}
          >
            Delete Task
          </button>
          <input
            type="submit"
            id="btn_SaveTask"
            value="Update Task"
          />
        </div>
      </form>
    </div>
  );
};