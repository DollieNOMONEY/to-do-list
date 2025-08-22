import React from 'react'

export default function WindowTaskInformation() {
  return (
    <form id="window__taskinformation">

        <div className="window__navigation__responsive">
            <h1 className="margin-xs">Task</h1>
            <button aria-label="Close Task Info" id="btn_CloseTaskInfo" type="button" className="mobile responsive__button margin_auto_adjust">
                <i className="fa-solid fa-x fa-2xl"></i>
            </button>
        </div>
        <input name="taskTitle" id="window__taskinformation__input_title" type="text" placeholder="Title" className="margin-sm"/>
            <textarea name="taskDescription" id="window__taskinformation__input_desc" placeholder="Description" className="margin-sm"></textarea>
            <div className="organization margin-sm">
                <label htmlFor="taskSections">List</label>
                <select name="taskSection" id="taskSections"></select>
            </div>
            <div className="organization margin-sm">
                <label htmlFor="window__taskinformation__input_duedate">Due Date</label>
                <input name="taskDueDate" id="window__taskinformation__input_duedate" type="date"/>
            </div>
            <div className="organization margin-sm">
                <label htmlFor="window__taskinformation__input_tags">Tag</label>
                <select name="tagSection" size={3} id="window__taskinformation__input_tags" multiple></select>
            </div>

            <h2>Subtasks</h2>
            <button id="btn_NewSubTask" type="button" className="margin-sm">+ New Subtask</button>
            <div id="window__taskinformation__subTaskList"></div>
            <div id="window__taskinformation__buttons">
                <button type="button" id="btn_DeleteTask">Delete Task</button>
                <input type="submit" id="btn_SaveTask" value="Update Task"/>
            </div>
    </form>
  )
}
