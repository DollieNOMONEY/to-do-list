// This component handles the display and interaction for filtering tasks by tags.
// It replaces logic from tag_manager.js.

'use client';

import React, { useState } from 'react';
// import { useTaskContext } from '../contexts/TaskContext';

interface TagFilterNavProps {
  tags: string[];
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onCreateTag: (tagName: string) => Promise<void>;
  onUpdateTag: (oldName: string, newName: string) => Promise<void>;
  onDeleteTag: (tagName: string) => Promise<void>;
}

export const TagFilterNav: React.FC<TagFilterNavProps> = ({
  tags,
  selectedTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagName, setEditingTagName] = useState<string | null>(null);
  const [editingInputText, setEditingInputText] = useState<string>('');

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onRemoveTag(tag);
    } else {
      onAddTag(tag);
    }
  };

  const handleCreateNewTag = async () => {
    const trimmedName = newTagName.trim();
    if (trimmedName && !tags.includes(trimmedName)) {
      await onCreateTag(trimmedName);
      setNewTagName('');
      setIsCreatingNew(false);
    } else if (trimmedName) {
      console.warn('Tag with this name already exists.');
    }
  };

  const handleDoubleClick = (tag: string) => {
    if (tag === 'Urgent' || tag === 'Important' || tag === 'Pending') return; // Cannot edit default tags
    setEditingTagName(tag);
    setEditingInputText(tag);
  };

  const handleInputBlur = async () => {
    if (!editingTagName) return;

    const trimmedInput = editingInputText.trim();
    if (trimmedInput === '') {
      await onDeleteTag(editingTagName); // Delete if empty
    } else if (trimmedInput !== editingTagName) {
      if (tags.includes(trimmedInput) && trimmedInput !== editingTagName) {
        console.warn('Tag with this name already exists.');
        setEditingInputText(editingTagName);
      } else {
        await onUpdateTag(editingTagName, trimmedInput);
      }
    }
    setEditingTagName(null);
    setEditingInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, originalName: string) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditingInputText(originalName);
      e.currentTarget.blur();
    }
  };

  return (
    <div id="window__navigation__section__3" className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div key={tag} className="flex items-center group">
            {editingTagName === tag ? (
              <input
                type="text"
                value={editingInputText}
                onChange={e => setEditingInputText(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={e => handleKeyDown(e, tag)}
                className="p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 rounded-sm w-24"
                autoFocus
              />
            ) : (
              <div
                onClick={() => handleTagClick(tag)}
                onDoubleClick={() => handleDoubleClick(tag)}
                className={`tag px-3 py-1 rounded-full cursor-pointer transition-colors text-sm
                  ${selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'
                  }`}
              >
                {tag}
              </div>
            )}
            {editingTagName === tag && (
              <button
                onClick={() => onDeleteTag(tag)}
                className="ml-1 px-1 py-0.5 text-red-600 hover:bg-red-100 rounded-md transition-colors text-xs"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        {isCreatingNew ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateNewTag();
                if (e.key === 'Escape') setIsCreatingNew(false);
              }}
              placeholder="New tag name"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateNewTag}
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
            + Add New Tag
          </button>
        )}
      </div>
    </div>
  );
};