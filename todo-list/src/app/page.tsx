// This is the main page component for your Next.js To-Do List application.
// It sets up the TaskContext provider and renders the core UI components.

'use client'; // This page needs client-side interactivity

import { TaskProvider, useTaskContext } from '@/contexts/TaskContext';
import { TaskList } from '@/components/TaskList';
import { SectionNav } from '@/components/SectionNav';
import { DueDateNav } from '@/components/DueDateNav';
import { TagFilterNav } from '@/components/TagFilterNav';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { MobileMenu } from '@/components/MobileMenu';
import { useEffect } from 'react';
import { formatDateToISO } from '@/lib/utils';

// Renamed and adapted from user's WindowTaskView.tsx
function MainTaskView() {
  const {
    addTask,
    filteredTasks,
    selectedSection,
    selectedDueDate,
    isLoading,
    error,
    toggleTaskDone,
    openTaskDetailModal,
  } = useTaskContext();

  // Adapted from user's WindowTaskView.tsx to use context data
  if (isLoading) return <p className="text-blue-600 p-4">Loading tasks...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;

  const defaultNewTask = {
    taskName: `New Task ${filteredTasks.length + 1}`,
    description: '',
    dueDate: formatDateToISO(new Date()), // Default due date is today's date in YYYY-MM-DD
    isDone: false,
    section: selectedSection !== 'All' ? selectedSection : 'Personal', // Use 'section'
    tags: [], // Use 'tags'
    subTasks: [], // Use 'subTasks'
  };

  return (
    <section id="window__taskview" className="flex-1 p-4 md:w-3/4">
      <div className="window__navigation__responsive flex items-center justify-between mb-6">
        {/* Mobile menu button, now handled by MobileMenu component */}
        {/* <button aria-label="Open Menu" id="btn_OpenMenu" type="button" className="mobile responsive__button">
            <i className="fa-solid fa-bars fa-2xl"></i>
          </button> */}
        <h1 id="window__taskview__title" className="text-2xl font-bold">
          {selectedDueDate !== 'All' ? selectedDueDate.toUpperCase() : selectedSection.toUpperCase()} Tasks
        </h1>
      </div>

      <div className="hidden" id="window__taskview__tagDisplay">
        <p className="tags_included">Tags Included:</p>
        {/* Tag display for selectedTags would go here if needed in main view */}
      </div>
      <br />
      <button
        type="button"
        id="btn_NewTask"
        onClick={() => addTask(defaultNewTask)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
      >
        Add New Task
      </button>

      <TaskList
        tasks={filteredTasks}
        onEditTask={openTaskDetailModal} // Directly opens modal and sets task in context
        onToggleTaskDone={toggleTaskDone}
      />
    </section>
  );
}

// Renamed and adapted from user's WindowNavigation.tsx to be integrated directly
function MainNavigation() {
  const {
    sections,
    selectedSection,
    setSelectedSection,
    selectedDueDate,
    setSelectedDueDate,
    tags, // For tag management in the nav
    addSelectedTags,
    removeSelectedTags,
    selectedTags,
    createSection,
    updateSection,
    deleteSection,
    createTag,
    updateTag,
    deleteTag,
  } = useTaskContext();

  return (
    <nav id="window__navigation" className="w-1/4 bg-white p-4 shadow-lg hidden md:block">
      <div className="margin-sm" id="window__navigation__section__1">
        <div className="window__navigation__responsive hidden">
          {/* Mobile menu button, now handled by MobileMenu component */}
          {/* <h1>Menu</h1>
          <button aria-label="Close Menu" id="btn_CloseMenu" type="button" className="mobile responsive__button margin_auto_adjust">
            <i className="fa-solid fa-x fa-2xl"></i>
          </button> */}
        </div>
        <br />
        <h6 className="text-gray-500 text-sm font-semibold mb-2">TASKS</h6>
        <DueDateNav selectedDueDate={selectedDueDate} onSelectDueDate={setSelectedDueDate} />
      </div>
      <div className="margin-sm mt-6" id="window__navigation__section__2">
        <h6 className="text-gray-500 text-sm font-semibold mb-2">SECTIONS</h6>
        <SectionNav
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          onCreateSection={createSection}
          onUpdateSection={updateSection}
          onDeleteSection={deleteSection}
        />
      </div>
      <div className="margin-sm mt-6" id="window__navigation__section__3">
        <h6 className="text-gray-500 text-sm font-semibold mb-2">TAGS</h6>
        <TagFilterNav
          tags={tags}
          selectedTags={selectedTags}
          onAddTag={addSelectedTags}
          onRemoveTag={removeSelectedTags}
          onCreateTag={createTag}
          onUpdateTag={updateTag}
          onDeleteTag={deleteTag}
        />
      </div>
      <div id="window__navigation__section__4" className="mt-8 pt-4 border-t border-gray-200 space-y-2">
        <button type="button" className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors">
          Settings
        </button>
        <button type="button" className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors">
          Signout
        </button>
      </div>
    </nav>
  );
}

// Main App component for the To-Do List
function AppContent() {
  const {
    isTaskDetailModalOpen,
    closeTaskDetailModal,
    selectedTask,
    updateTask,
    deleteTask,
    createNewSubTask,
    deleteSubTask,
    updateSubTask,
    toggleSubTaskDone,
    sections,
    tags,
    readTasks,
  } = useTaskContext();

  // Initial data loading and checkbox syncing on mount
  useEffect(() => {
    readTasks();
  }, [readTasks]);

  return (
    <div className="container flex min-h-screen bg-gray-100 font-sans">
      {/* Mobile Menu (init__mobile logic) */}
      <MobileMenu />

      {/* Left Navigation (windowNavigation) */}
      <MainNavigation />

      {/* Main Task View (windowTaskView) */}
      <MainTaskView />

      {/* Task Information/Detail Modal */}
      {isTaskDetailModalOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeTaskDetailModal}
          onUpdate={updateTask}
          onDelete={deleteTask}
          createNewSubTask={createNewSubTask}
          deleteSubTask={deleteSubTask}
          updateSubTask={updateSubTask}
          onToggleSubTaskDone={toggleSubTaskDone}
          sections={sections} // Pass sections to the modal for dropdown
          tags={tags} // Pass tags to the modal for selection
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}