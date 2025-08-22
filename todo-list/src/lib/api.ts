// This file centralizes all API calls to Kotlin backend.

import { Task } from '../contexts/TaskContext'; // Import the Task interface

const API_BASE_URL = 'http://localhost:8080/api'; // Kotlin backend URL

// Generic error handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || `API request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Fetch all tasks
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/get-tasks`);
  const tasks = await handleResponse<Task[]>(response);
  // Ensure subTasks is an array, even if null from backend
  return tasks.map(task => ({
    ...task,
    subTasks: task.subTasks || [],
    tags: task.tags || []
  }));
}

// Create a new task
export async function createTaskApi(task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

// Update an existing task
export async function updateTaskApi(task: Task): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

// Delete a task
export async function deleteTaskApi(taskId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task with ID ${taskId}. Status: ${response.status}`);
  }
  return; // No content for successful delete
}