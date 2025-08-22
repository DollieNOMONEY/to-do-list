import React from 'react'

export default function WindowNavigation() {
  return (
    <nav id="window__navigation">
        <div className="margin-sm" id="window__navigation__section__1">
            <div className="window__navigation__responsive">
                <h1>Menu</h1>
                <button aria-label="Close Menu" id="btn_CloseMenu" type="button" className="mobile responsive__button margin_auto_adjust">
                    <i className="fa-solid fa-x fa-2xl"></i>
                </button>
            </div>
            <br/>
            <h6>TASKS</h6>
            <a>All</a>
            <a>Upcoming</a>
            <a>Today</a>
            <a>Overdue</a>
            <a>Done</a>
        </div>
        <div className="margin-sm" id="window__navigation__section__2">
            <h6>SECTIONS</h6>
            <button type="button" className="margin-sm">+ New List</button>
            <a>All</a>
        </div>
        <div className="margin-sm" id="window__navigation__section__3">
            <h6 className="margin-sm">TAGS</h6>
            <button type="button" className="margin-sm hidden">+ Add Tag</button>
            <div className='tag'>Urgent</div>
        </div>
        <div id="window__navigation__section__4">
            <button type="button" >Settings</button>
            <button type="button" >Signout</button>
        </div>
    </nav>
  )
}
