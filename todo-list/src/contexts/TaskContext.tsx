// src/contexts/TaskContext.tsx
// This file sets up a React Context to manage the global state of your To-Do list.
// It replaces the global variables (listOfTasks, selectedSection, etc.) and
// provides functions to interact with your API.

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateUniqueId, formatDateToISO } from '../lib/utils'; // Assuming utilities are here
import {
  fetchTasks,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  // Removed API functions for sections and tags as they are now part of Task
} from '../lib/api'; // Your API functions

// Define the shape of your task, subtask, etc.
export interface SubTask {
  id: number; // Matches Kotlin's Long
  title: string; // Matches Kotlin's 'title'
  completed: boolean; // Matches Kotlin's 'completed'
}

// Updated Task interface to match Kotlin's 'data class Task' more closely
export interface Task {
  id: number; // Matches Kotlin's Long
  taskName: string; // Maps to Kotlin's 'task'
  isDone: boolean;  // Matches Kotlin's 'isDone'
  dueDate: string;  // Matches Kotlin's 'dueDate' (e.g., "YYYY-MM-DD")
  description: string; // Matches Kotlin's 'description'
  section: string; // Matches Kotlin's 'section'
  tags: string[]; // Matches Kotlin's 'tags'
  subTasks: SubTask[]; // Matches Kotlin's 'subTasks'
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  sections: string[]; // List of all available sections
  tags: string[]; // List of all available tags
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  floating: string;
  setFloating: (floating: string) => void;
  selectedDueDate: string;
  setSelectedDueDate: (date: string) => void;
  selectedTags: string[];
  addSelectedTags: (tag: string) => void;
  removeSelectedTags: (tag: string) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isTaskDetailModalOpen: boolean;
  openTaskDetailModal: (task: Task) => void;
  closeTaskDetailModal: () => void;
  addTask: (newTask: Partial<Task>) => Promise<void>;
  updateTask: (updatedTask: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  toggleTaskDone: (taskId: number, isDone: boolean) => Promise<void>;
  createSection: (sectionName: string) => Promise<void>; // Local UI management only
  updateSection: (oldName: string, newName: string) => Promise<void>; // Local UI management only
  deleteSection: (sectionName: string) => Promise<void>; // Local UI management only
  createTag: (tagName: string) => Promise<void>; // Local UI management only
  updateTag: (oldName: string, newName: string) => Promise<void>; // Local UI management only
  deleteTag: (tagName: string) => Promise<void>; // Local UI management only
  createNewSubTask: (taskId: number, subTaskTitle: string) => Promise<void>;
  deleteSubTask: (taskId: number, subTaskId: number) => Promise<void>;
  updateSubTask: (taskId: number, subTaskId: number, newTitle: string, completed: boolean) => Promise<void>;
  toggleSubTaskDone: (taskId: number, subTaskId: number, completed: boolean) => Promise<void>;
  syncCheckboxesWithTasks: () => void;
  isLoading: boolean;
  error: string | null;
  readTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Managed locally for display/selection, not explicitly fetched from backend for now
  const [sections, setSections] = useState<string[]>(['All', 'Personal', 'Work']);
  const [tags, setTags] = useState<string[]>(['Urgent', 'Important', 'Pending']);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floating, setFloating] = useState<string>('All'); // Added floating state

  // --- API Fetching ---
  const readTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await fetchTasks();
      // Ensure section and tags are added to local state from fetched tasks
      const allSections = new Set<string>(['All', 'Personal', 'Work']);
      const allTags = new Set<string>(['Urgent', 'Important', 'Pending']);
      fetchedTasks.forEach(task => {
        if (task.section) allSections.add(task.section);
        task.tags?.forEach(tag => allTags.add(tag));
      });
      setSections(Array.from(allSections));
      setTags(Array.from(allTags));

      setTasks(fetchedTasks);
    } catch (err: unknown) { // FIX: Changed 'any' to 'unknown'
      if (err instanceof Error) { // FIX: Added type guard
        setError(`Failed to fetch tasks: ${err.message}`);
      } else {
        setError(`Failed to fetch tasks: An unknown error occurred`);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    readTasks();
  }, [readTasks]);

  // --- Task Operations ---
  const addTask = async (newTaskData: Partial<Task>) => {
    try {
      // dueDate is already YYYY-MM-DD
      const newSubTasks: SubTask[] = newTaskData.subTasks ? newTaskData.subTasks.map(st => ({ id: 0, title: st.title, completed: st.completed })) : [];

      const newTask: Task = {
        id: 0, // ID will be assigned by Kotlin backend
        taskName: newTaskData.taskName || 'New Task',
        description: newTaskData.description || '',
        dueDate: newTaskData.dueDate || formatDateToISO(new Date()), // Use actual date
        isDone: newTaskData.isDone || false,
        section: newTaskData.section || (selectedSection !== 'All' ? selectedSection : 'Personal'),
        tags: newTaskData.tags || [],
        subTasks: newSubTasks,
      };

      const createdTask = await createTaskApi(newTask);
      setTasks(prev => [...prev, createdTask]); // Backend returns full task with IDs
      readTasks(); // Re-read to ensure consistency and update sections/tags list
    } catch (err: unknown) { // FIX: Changed 'any' to 'unknown'
      if (err instanceof Error) { // FIX: Added type guard
        setError(`Failed to add task: ${err.message}`);
      } else {
        setError(`Failed to add task: An unknown error occurred`);
      }
      console.error(err);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      // dueDate is already YYYY-MM-DD
      const taskForApi = {
        ...updatedTask,
        subTasks: updatedTask.subTasks.map(st => ({
          ...st,
          id: st.id === 0 ? undefined : st.id // Ensure new subtasks have ID 0 or undefined for backend to assign
        }))
      };

      const result = await updateTaskApi(taskForApi);
      if (result) {
        setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
        setSelectedTask(updatedTask); // Keep modal's task updated
        readTasks(); // Re-read to ensure consistency and update sections/tags list
      } else {
        throw new Error("API update failed.");
      }
    } catch (err: unknown) { // FIX: Changed 'any' to 'unknown'
      if (err instanceof Error) { // FIX: Added type guard
        setError(`Failed to update task: ${err.message}`);
      } else {
        setError(`Failed to update task: An unknown error occurred`);
      }
      console.error(err);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await deleteTaskApi(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      closeTaskDetailModal();
      readTasks(); // Re-read to ensure consistency and update sections/tags list
    } catch (err: unknown) { // FIX: Changed 'any' to 'unknown'
      if (err instanceof Error) { // FIX: Added type guard
        setError(`Failed to delete task: ${err.message}`);
      } else {
        setError(`Failed to delete task: An unknown error occurred`);
      }
      console.error(err);
    }
  };

  const toggleTaskDone = async (taskId: number, isDone: boolean) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
    const updatedTask = { ...taskToUpdate, isDone: isDone };
    await updateTask(updatedTask);
  };

  // --- SubTask Operations ---
  const createNewSubTask = async (taskId: number, subTaskTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubTask: SubTask = {
      id: 0, // Backend will assign ID
      title: subTaskTitle,
      completed: false,
    };
    const updatedTask = {
      ...task,
      subTasks: [...(task.subTasks || []), newSubTask],
    };
    await updateTask(updatedTask);
  };

  const deleteSubTask = async (taskId: number, subTaskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      subTasks: task.subTasks.filter(st => st.id !== subTaskId),
    };
    await updateTask(updatedTask);
  };

  const updateSubTask = async (taskId: number, subTaskId: number, newTitle: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      subTasks: task.subTasks.map(st =>
        st.id === subTaskId ? { ...st, title: newTitle, completed: completed } : st
      ),
    };
    await updateTask(updatedTask);
  };

  const toggleSubTaskDone = async (taskId: number, subTaskId: number, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      subTasks: task.subTasks.map(st =>
        st.id === subTaskId ? { ...st, completed: completed } : st
      ),
    };
    await updateTask(updatedTask);
  };


  // --- Section Operations (Local UI management, persisted with task) ---
  const createSection = async (sectionName: string) => {
    if (!sections.includes(sectionName)) {
      setSections(prev => ['All', ...prev.filter(s => s !== 'All'), sectionName]);
    }
  };

  const updateSection = async (oldName: string, newName: string) => {
    if (oldName === 'All') return; // Cannot edit 'All'
    if (sections.includes(newName) && newName !== oldName) {
      console.warn('Section with this name already exists.');
      return;
    }
    setSections(prev => prev.map(s => (s === oldName ? newName : s)));
    // Update tasks that belong to this section
    const tasksToUpdate = tasks.filter(task => task.section === oldName);
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, section: newName });
    }
    if (selectedSection === oldName) setSelectedSection(newName);
  };

  const deleteSection = async (sectionName: string) => {
    if (sectionName === 'All' || sectionName === 'Personal' || sectionName === 'Work') return; // Prevent deleting defaults
    setSections(prev => prev.filter(s => s !== sectionName));
    // Reassign tasks from deleted section to a default (e.g., 'Personal')
    const tasksToUpdate = tasks.filter(task => task.section === sectionName);
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, section: 'Personal' });
    }
    if (selectedSection === sectionName) setSelectedSection('All');
  };

  // --- Tag Operations (Local UI management, persisted with task) ---
  const createTag = async (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags(prev => [...prev, tagName]);
    }
  };

  const updateTag = async (oldName: string, newName: string) => {
    if (tags.includes(newName) && newName !== oldName) {
      console.warn('Tag with this name already exists.');
      return;
    }
    setTags(prev => prev.map(t => (t === oldName ? newName : t)));
    // Update tasks that use this tag
    const tasksToUpdate = tasks.filter(task => task.tags.includes(oldName));
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, tags: task.tags.map(t => (t === oldName ? newName : t)) });
    }
    setSelectedTags(prev => prev.map(t => (t === oldName ? newName : t)));
  };

  const deleteTag = async (tagName: string) => {
    if (tagName === 'Urgent' || tagName === 'Important' || tagName === 'Pending') return; // Prevent deleting defaults
    setTags(prev => prev.filter(t => t !== tagName));
    // Remove tag from all tasks
    const tasksToUpdate = tasks.filter(task => task.tags.includes(tagName));
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, tags: task.tags.filter(t => t !== tagName) });
    }
    setSelectedTags(prev => prev.filter(t => t !== tagName));
  };


  // --- Filtering Logic ---
  const filteredTasks = tasks.filter(task => {
    // Filter by Section
    const bySection = selectedSection === 'All' || task.section === selectedSection;

    // Filter by Due Date
    const byDueDate = (() => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

      if (!task.dueDate) {
        return false; // Or handle tasks with no due date differently
      }

      const taskDate = new Date(task.dueDate + 'T00:00:00Z'); // Parse as UTC date to avoid timezone issues
      taskDate.setUTCHours(0, 0, 0, 0);

      switch (selectedDueDate) {
        case 'All':
          return true;
        case 'Today':
          return taskDate.getTime() === today.getTime();
        case 'Upcoming':
          return taskDate.getTime() > today.getTime() && !task.isDone;
        case 'Overdue':
          return taskDate.getTime() < today.getTime() && !task.isDone;
        case 'Done':
          return task.isDone;
        default:
          return true;
      }
    })();

    // Filter by Tags
    const byTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags?.includes(tag));

    // Combine filters
    return bySection && byDueDate && byTags;
  });

  // --- Sync Checkboxes (from syncCheckboxesWithTasks) ---
  const syncCheckboxesWithTasks = () => {
    // In React, this is handled implicitly by `task.isDone ? 'checked' : ''` in JSX.
    // However, if tasks were loaded from API and some are done, this ensures UI reflects it.
    // No direct DOM manipulation needed here.
  };

  // --- Modal Management ---
  const openTaskDetailModal = (task: Task) => {
    // dueDate is already YYYY-MM-DD from backend
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const closeTaskDetailModal = () => {
    setSelectedTask(null);
    setIsTaskDetailModalOpen(false);
  };

  const value = {
    tasks,
    filteredTasks,
    sections,
    tags,
    selectedSection,
    setSelectedSection,
    floating,
    setFloating,
    selectedDueDate,
    setSelectedDueDate,
    selectedTags,
    addSelectedTags: (tag: string) => setSelectedTags(prev => [...new Set([...prev, tag])]),
    removeSelectedTags: (tag: string) => setSelectedTags(prev => prev.filter(t => t !== tag)),
    selectedTask,
    setSelectedTask,
    isTaskDetailModalOpen,
    openTaskDetailModal,
    closeTaskDetailModal,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    createSection,
    updateSection,
    deleteSection,
    createTag,
    updateTag,
    deleteTag,
    createNewSubTask,
    deleteSubTask,
    updateSubTask,
    toggleSubTaskDone,
    syncCheckboxesWithTasks,
    isLoading,
    error,
    readTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};