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
