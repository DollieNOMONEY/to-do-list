// This component handles the display and interaction for task sections.
// It replaces logic from section_manager.js.

'use client';

import React, { useState } from 'react';

interface SectionNavProps {
  sections: string[];
  selectedSection: string;
  onSelectSection: (section: string) => void;
  onCreateSection: (sectionName: string) => Promise<void>;
  onUpdateSection: (oldName: string, newName: string) => Promise<void>;
  onDeleteSection: (sectionName: string) => Promise<void>;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  selectedSection,
  onSelectSection,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
}) => {
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [editingInputText, setEditingInputText] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const handleDoubleClick = (section: string) => {
    if (section === 'All' || section === 'Personal' || section === 'Work') return; // Cannot edit default sections
    setEditingSectionName(section);
    setEditingInputText(section);
  };

  const handleInputBlur = async () => {
    if (!editingSectionName) return;

    const trimmedInput = editingInputText.trim();
    if (trimmedInput === '') {
      await onDeleteSection(editingSectionName); // Delete if empty
    } else if (trimmedInput !== editingSectionName) {
      // Check for duplicates
      if (sections.includes(trimmedInput) && trimmedInput !== editingSectionName) {
        console.warn('Section with this name already exists.');
        setEditingInputText(editingSectionName); // Revert
      } else {
        await onUpdateSection(editingSectionName, trimmedInput);
      }
    }
    setEditingSectionName(null);
    setEditingInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, originalName: string) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditingInputText(originalName); // Revert
      e.currentTarget.blur();
    }
  };

  const handleCreateNewSection = async () => {
    const trimmedName = newSectionName.trim();
    if (trimmedName && !sections.includes(trimmedName)) {
      await onCreateSection(trimmedName);
      setNewSectionName('');
      setIsCreatingNew(false);
    } else if (trimmedName) {
      console.warn('Section with this name already exists.');
    }
  };

  return (
    <div id="window__navigation__section__2" className="space-y-2">
      {sections.map(section => (
        <div key={section} className="flex items-center group">
          {editingSectionName === section && section !== 'All' ? (
            <input
              type="text"
              value={editingInputText}
              onChange={e => setEditingInputText(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={e => handleKeyDown(e, section)}
              className="flex-1 p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 rounded-sm"
              autoFocus
            />
          ) : (
            <span
              onClick={() => onSelectSection(section)}
              onDoubleClick={() => handleDoubleClick(section)}
              className={`flex-1 block p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedSection === section ? 'font-bold text-blue-600 bg-blue-50' : ''
              }`}
            >
              {section}
            </span>
          )}
          {section !== 'All' && editingSectionName === section && (
            <button
              onClick={() => onDeleteSection(section)}
              className="ml-2 px-2 py-1 text-red-600 hover:bg-red-100 rounded-md transition-colors text-sm"
            >
              Delete
            </button>
          )}
        </div>
      ))}
      <div className="mt-4">
        {isCreatingNew ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateNewSection();
                if (e.key === 'Escape') setIsCreatingNew(false);
              }}
              placeholder="New section name"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateNewSection}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mt-2"
          >
            + Add New Section
          </button>
        )}
      </div>
    </div>
  );
};