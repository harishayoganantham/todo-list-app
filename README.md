# TaskFlow — To-Do List App

A responsive, client-side task manager built with semantic HTML5, CSS, and vanilla JavaScript.

## Run the project
1. Extract `todo-list-app.zip`.
2. Open the extracted `todo-list-app` folder.
3. Double-click `index.html` to launch it in your browser.

No installation, server, or database is required.

## Features
- Create, read, update, and delete tasks (CRUD).
- Mark tasks active or completed.
- Filter by All, Active, and Completed.
- Clear all completed tasks.
- Automatically saves tasks in `window.localStorage`.
- Restores saved tasks after refreshing or reopening the browser.
- Responsive layout for desktop and mobile.
- Accessible labels, keyboard-friendly controls, and reduced-motion support.

## Project structure
- `index.html` — semantic page structure
- `style.css` — responsive styling
- `script.js` — application state, DOM rendering, events, and local storage

## Implementation notes
- Tasks are stored under the local storage key `taskflow-todos-v1`.
- The interface is rendered from the `tasks` state array.
- Event delegation is used for dynamically created task controls.
- Data stays in the current browser profile on this device. Clearing browser site data can remove it.
