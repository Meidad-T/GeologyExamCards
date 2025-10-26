# Clashcards — Minerals flashcards

Static, lightweight flashcard site that uses the images in the `minerals/` folder.

Features
- Click the card to flip between image (front) and name (back).
- Next and Previous buttons to navigate cards.
- Keyboard support: ←/→ to navigate, Space/Enter to flip.

How to run locally
- Recommended: use a simple static server (so the browser can fetch `images.json`). Example using Python (PowerShell):

```powershell
# from the project root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or use VS Code Live Server extension.

Project files added
- `index.html` — main UI
- `style.css` — styles and flip animation
- `script.js` — loads `images.json` and handles flipping/navigation
- `images.json` — listing of images in `minerals/`

Notes
- If you add or remove images from `minerals/`, update `images.json` (or ask me to regenerate it). Filenames in `images.json` are used as provided; the `name` field is used on the back of the card.
