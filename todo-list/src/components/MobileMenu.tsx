// This component handles the mobile navigation menu.
// It replaces logic from mobile_manager.js.

'use client';

import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { SectionNav } from './SectionNav';
import { DueDateNav } from './DueDateNav';
import { TagFilterNav } from './TagFilterNav';
// TaskDetailModal is not directly imported here, but its state controls this component's behavior

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedSection,
    setSelectedSection,
    sections,
    selectedDueDate,
    setSelectedDueDate,
    selectedTags,
    addSelectedTags,
    removeSelectedTags,
    tags,
    isTaskDetailModalOpen, // Check if modal is open to adjust mobile menu behavior
    createSection,
    updateSection,
    deleteSection,
    createTag,
    updateTag,
    deleteTag,
  } = useTaskContext();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Control body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  };

  // Close menu if task detail modal opens, or handle interaction based on your UX
  useEffect(() => {
    if (isTaskDetailModalOpen && isOpen) {
      setIsOpen(false);
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTaskDetailModalOpen, isOpen]);


  return (
    <>
      {/* Hamburger Icon */}
      {!isOpen && (
        <button
          id="btn_OpenMenu"
          onClick={toggleMenu}
          className="mobile fixed top-4 left-4 p-2 bg-blue-600 text-white rounded-md md:hidden z-40 shadow-lg"
        >
          <i className="fa-solid fa-bars fa-xl"></i>
        </button>
      )}

      {/* Mobile Navigation Sidebar */}
      <div
        id="windowNavigation"
        className={`fixed top-0 left-0 h-full bg-white w-3/4 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ display: isOpen ? 'block' : 'none' }} // Hide completely when not open
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button
            id="btn_CloseMenu"
            onClick={toggleMenu}
            className="mobile p-2 text-gray-600 hover:text-gray-900"
          >
            <i className="fa-solid fa-times fa-xl"></i>
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Sections</h3>
            <SectionNav
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={section => {
                setSelectedSection(section);
                toggleMenu(); // Close menu after selection
              }}
              onCreateSection={createSection}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Due Dates</h3>
            <DueDateNav
              selectedDueDate={selectedDueDate}
              onSelectDueDate={date => {
                setSelectedDueDate(date);
                toggleMenu(); // Close menu after selection
              }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Tags</h3>
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
           <div className="mt-8 pt-4 border-t border-gray-200 space-y-2">
            <button type="button" className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors">
              Settings
            </button>
            <button type="button" className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors">
              Signout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};