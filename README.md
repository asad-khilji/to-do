# Static To-Do List

This is a converted static version of the original PHP/MySQL to-do app.

## Files

- `index.html` — app layout
- `style.css` — styling
- `script.js` — add, edit, delete, filter, search, export, and reset logic
- `tasks.json` — starter task data converted from the SQL dump

## How to run

Open `index.html` in a browser, or serve the folder with any static server.

For best `tasks.json` loading behavior, run a local static server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
## Notes

- Data is saved in browser `localStorage`.
- Export JSON downloads the current task list as `tasks-export.json`.
- File uploads are represented by attachment filenames only because a static HTML/CSS/JS app has no server upload folder.
- Email notification uses `mailto:` and opens the user's email app when a task status changes and recipients are selected.

- ## Problem
The original To-Do application required PHP and MySQL, making it difficult for users to run without configuring a server and database.

## UX Design Solution
The application was redesigned as a browser-based solution using HTML, CSS, JavaScript, and JSON.

### UX Improvements
- Clean and minimal interface for quick learning.
- Fast task creation with a single input and Add button.
- Immediate visual feedback when tasks are added, completed, or deleted.
- Completed tasks are clearly differentiated from active tasks.
- Responsive layout for desktop and mobile.
- LocalStorage replaces the database so changes are saved automatically.
- Reduced cognitive load by keeping only essential actions on screen.

## Result
Users can simply open **index.html** in any modern browser and start managing tasks without installing PHP, MySQL, or any backend software.
