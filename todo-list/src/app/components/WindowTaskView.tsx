"use client"
import { useEffect, useState } from 'react'

interface Task {
  id: number,
  task: string; // Changed from taskName to task to match usage in the original snippet's render
  isDone: boolean;
  dueDate: string;
  description: string;
}

export default function WindowTaskView() {
  // State to manage loading status for user feedback
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold any error messages during fetching
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        // IMPORTANT: Replace this with the actual URL of your deployed Kotlin backend
        // For example: 'https://your-kotlin-backend-name.onrender.com/api'
        const API_BASE_URL = ''; // <-- Ensure this is set to your deployed backend URL

        const request = await fetch(`${API_BASE_URL}/get-tasks`);

        if (!request.ok) {
          throw new Error(`HTTP Error! Status: ${request.status}`)
        }

        const result: Task[] = await request.json();
        setTasks(result);
        console.log(result);
      } catch (error: unknown) { // Changed 'any' to 'unknown'
        // Type guard to safely access error properties
        if (error instanceof Error) {
          console.error("Error fetching tasks:", error.message);
          setError(error.message); // Set the error message for display
        } else {
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred."); // Generic message for unknown error types
        }
      } finally {
        setLoading(false); // Set loading to false after fetch completes (whether success or error)
      }
    }
    fetchData();
  }, []);

  return (
    <section id="window__taskview">
        <div className="window__navigation__responsive">
            <button aria-label="Open Menu" id="btn_OpenMenu" type="button" className="mobile responsive__button">
                <i className="fa-solid fa-bars fa-2xl"></i>
            </button>
            <h1 id="window__taskview__title">TODAY</h1>
        </div>
        <div className="hidden" id="window__taskview__tagDisplay">
            <p className="tags_included">Tags Included:</p>
        </div>
        <br/>
        <button type="button" id="btn_NewTask">Add New Task</button>

        <div id="taskList" className="space-y-4">
        {loading && <p className="text-blue-600">Loading tasks...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && tasks.length === 0 && (
          <p className="text-gray-500">No tasks found. Start by adding a new task!</p>
        )}

        {/* Render the list of tasks */}
        {!loading && !error && tasks.length > 0 && (
          <ul className="list-none p-0 m-0">
            {tasks.map((taskItem) => (
              <li key={taskItem.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{taskItem.task}</h3>
                  <p className="text-sm text-gray-700">{taskItem.description}</p>
                  <p className="text-xs text-gray-500">Due: {taskItem.dueDate}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${taskItem.isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {taskItem.isDone ? 'Done' : 'Pending'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </section>
  )
}
