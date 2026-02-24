# IWJCLAIMS React Conversion (Vite + React + TS)

## Setup
```bash
npm install
npm run dev
```

## Notes
- `public/assets` contains the original template assets (CSS/Images/JS).
- Pages are generated from the original `.html` files and rendered using `dangerouslySetInnerHTML`
  inside a shared React layout (Sidebar + Header).
- Internal links like `*.html` were converted to SPA routes.

If you want full React components (no innerHTML) and interactive tables/calendar, tell me which pages to convert first.
