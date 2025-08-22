// src/contexts/TaskContext.tsx
// This file sets up a React Context to manage the global state of your To-Do list.
// It replaces the global variables (listOfTasks, selectedSection, etc.) and
// provides functions to interact with your API.

// src/contexts/TaskContext.tsx
// This file sets up a React Context to manage the global state of your To-Do list.

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { generateUniqueId, formatDateToISO } from '../lib/utils';
import { formatDateToISO } from '../lib/utils';
import {
  fetchTasks,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '../lib/api';

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  taskName: string;
  isDone: boolean;
  dueDate: string;
  description: string;
  section: string;
  tags: string[];
  subTasks: SubTask[];
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  sections: string[];
  tags: string[];
  selectedSection: string;
  setSelectedSection: (section: string) => void;
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
  createSection: (sectionName: string) => Promise<void>;
  updateSection: (oldName: string, newName: string) => Promise<void>;
  deleteSection: (sectionName: string) => Promise<void>;
  createTag: (tagName: string) => Promise<void>;
  updateTag: (oldName: string, newName: string) => Promise<void>;
  deleteTag: (tagName: string) => Promise<void>;
  createNewSubTask: (taskId: number, subTaskTitle: string) => Promise<void>;
  deleteSubTask: (taskId: number, subTaskId: number) => Promise<void>;
  updateSubTask: (taskId: number, subTaskId: number, newTitle: string, completed: boolean) => Promise<void>;
  toggleSubTaskDone: (taskId: number, subTaskId: number, completed: boolean) => Promise<void>;
  syncCheckboxesWithTasks: () => void;
  isLoading: boolean;
  error: string | null;
  readTasks: () => Promise<void>;
  floating: string; // Added floating state
  setFloating: (floating: string) => void; // Added floating state setter
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sections, setSections] = useState<string[]>(['All', 'Personal', 'Work']);
  const [tags, setTags] = useState<string[]>(['Urgent', 'Important', 'Pending']);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floating, setFloating] = useState<string>('All'); // Initializing floating state

  const readTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await fetchTasks();
      const allSections = new Set<string>(['All', 'Personal', 'Work']);
      const allTags = new Set<string>(['Urgent', 'Important', 'Pending']);
      fetchedTasks.forEach(task => {
        if (task.section) allSections.add(task.section);
        task.tags?.forEach(tag => allTags.add(tag));
      });
      setSections(Array.from(allSections));
      setTags(Array.from(allTags));
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      if (err instanceof Error) {
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

  const addTask = async (newTaskData: Partial<Task>) => {
    try {
      const newSubTasks: SubTask[] = newTaskData.subTasks ? newTaskData.subTasks.map(st => ({ id: 0, title: st.title, completed: st.completed })) : [];
      const newTask: Task = {
        id: 0,
        taskName: newTaskData.taskName || 'New Task',
        description: newTaskData.description || '',
        dueDate: newTaskData.dueDate || formatDateToISO(new Date()),
        isDone: newTaskData.isDone || false,
        section: newTaskData.section || (selectedSection !== 'All' ? selectedSection : 'Personal'),
        tags: newTaskData.tags || [],
        subTasks: newSubTasks,
      };
      const createdTask = await createTaskApi(newTask);
      setTasks(prev => [...prev, createdTask]);
      readTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to add task: ${err.message}`);
      } else {
        setError(`Failed to add task: An unknown error occurred`);
      }
      console.error(err);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskForApi = {
        ...updatedTask,
        subTasks: updatedTask.subTasks.map(st => {
          // --- FIX START ---
          if (st.id === 0) { // If it's a new subtask (ID 0)
            const { id, ...rest } = st; // Omit the 'id' property
            return rest as SubTask; // Cast to SubTask, as 'id' is now optional for new subtasks sent to API
          }
          return st; // For existing subtasks, keep the ID
          // --- FIX END ---
        })
      };

      const result = await updateTaskApi(taskForApi);
      if (result) {
        setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
        setSelectedTask(updatedTask);
        readTasks();
      } else {
        throw new Error("API update failed.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
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
      readTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
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

  const createNewSubTask = async (taskId: number, subTaskTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubTask: SubTask = { id: 0, title: subTaskTitle, completed: false };
    const updatedTask = { ...task, subTasks: [...(task.subTasks || []), newSubTask] };
    await updateTask(updatedTask);
  };

  const deleteSubTask = async (taskId: number, subTaskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, subTasks: task.subTasks.filter(st => st.id !== subTaskId) };
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

  const createSection = async (sectionName: string) => {
    if (!sections.includes(sectionName)) {
      setSections(prev => ['All', ...prev.filter(s => s !== 'All'), sectionName]);
    }
  };

  const updateSection = async (oldName: string, newName: string) => {
    if (oldName === 'All') return;
    if (sections.includes(newName) && newName !== oldName) {
      console.warn('Section with this name already exists.');
      return;
    }
    setSections(prev => prev.map(s => (s === oldName ? newName : s)));
    const tasksToUpdate = tasks.filter(task => task.section === oldName);
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, section: newName });
    }
    if (selectedSection === oldName) setSelectedSection(newName);
  };

  const deleteSection = async (sectionName: string) => {
    if (sectionName === 'All' || sectionName === 'Personal' || sectionName === 'Work') return;
    setSections(prev => prev.filter(s => s !== sectionName));
    const tasksToUpdate = tasks.filter(task => task.section === sectionName);
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, section: 'Personal' });
    }
    if (selectedSection === sectionName) setSelectedSection('All');
  };

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
    const tasksToUpdate = tasks.filter(task => task.tags.includes(oldName));
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, tags: task.tags.map(t => (t === oldName ? newName : t)) });
    }
    setSelectedTags(prev => prev.map(t => (t === oldName ? newName : t)));
  };

  const deleteTag = async (tagName: string) => {
    if (tagName === 'Urgent' || tagName === 'Important' || tagName === 'Pending') return;
    setTags(prev => prev.filter(t => t !== tagName));
    const tasksToUpdate = tasks.filter(task => task.tags.includes(tagName));
    for (const task of tasksToUpdate) {
      await updateTask({ ...task, tags: task.tags.filter(t => t !== tagName) });
    }
    setSelectedTags(prev => prev.filter(t => t !== tagName));
  };

  const filteredTasks = tasks.filter(task => {
    const bySection = selectedSection === 'All' || task.section === selectedSection;
    const byDueDate = (() => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      if (!task.dueDate) {
        return false;
      }

      const taskDate = new Date(task.dueDate + 'T00:00:00Z');
      taskDate.setUTCHours(0, 0, 0, 0);

      switch (selectedDueDate) {
        case 'All': return true;
        case 'Today': return taskDate.getTime() === today.getTime();
        case 'Upcoming': return taskDate.getTime() > today.getTime() && !task.isDone;
        case 'Overdue': return taskDate.getTime() < today.getTime() && !task.isDone;
        case 'Done': return task.isDone;
        default: return true;
      }
    })();
    const byTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags?.includes(tag));
    return bySection && byDueDate && byTags;
  });

  const syncCheckboxesWithTasks = () => {};

  const openTaskDetailModal = (task: Task) => {
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