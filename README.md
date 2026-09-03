# Koichi Sato — Resume

Editorial resume portfolio with custom cursor, motion, and a simple admin CMS.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Windows (.bat)

| File | What it does |
|------|----------------|
| `install.bat` | Install npm packages |
| `run.bat` | Start dev server (http://localhost:3000) |
| `build.bat` | Production build |
| `start-production.bat` | Serve the production build |

Double-click them in File Explorer, or from a terminal in this folder.

## Sections

Summary · Experience · Education · Skills · Certificates

## Admin

http://localhost:3000/admin  
Default: `koichisato049@gmail.com`

## Storage

| Environment | Text / settings | UI images & files |
|-------------|----------------|-------------------|
| Local | SQLite `data/portfolio.db` | `public/uploads/` |
| Netlify | Netlify Blobs (`portfolio-data`) | Netlify Blobs (`portfolio-uploads`), served at `/uploads/...` |

Uploaded images are for the live UI (hero, skills, projects, education, shop, etc.). Paths like `/uploads/….png` are stored in the database and shown in `<img>` tags.

## Deploy (Netlify)

Connect the repo and deploy. Set `ADMIN_SECRET` (and optional `OPENAI_API_KEY`) in Netlify environment variables.
