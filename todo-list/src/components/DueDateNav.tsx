// This component handles filtering tasks by due date.
// It replaces logic from taskduedate_manager.js.

'use client';

import React from 'react';

interface DueDateNavProps {
  selectedDueDate: string;
  onSelectDueDate: (date: string) => void;
}

export const DueDateNav: React.FC<DueDateNavProps> = ({ selectedDueDate, onSelectDueDate }) => {
  const dateOptions = ['All', 'Today', 'Upcoming', 'Overdue', 'Done'];

  return (
    <div id="window__navigation__section__1" className="space-y-2">
      {dateOptions.map(option => (
        <span
          key={option}
          onClick={() => onSelectDueDate(option)}
          className={`block p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            selectedDueDate === option ? 'font-bold text-blue-600 bg-blue-50' : ''
          }`}
        >
          {option}
        </span>
      ))}
    </div>
  );
};