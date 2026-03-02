# Deploy CAPA AI Demo to Vercel

The dashboard runs in **Demo Mode** by default — no backend required. Perfect for Vercel deployment.

---

## Option 1: Deploy from GitHub (Recommended)

### 1. Push to GitHub

```bash
git add .
git commit -m "Add CAPA AI demo"
git push origin main
```

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo (`kuntumseroja/CPAI` or your fork)
3. **Important:** Set **Root Directory** to `dashboard`
   - Click "Edit" next to Root Directory
   - Enter `dashboard`
4. Vercel will auto-detect Vite. Build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**

### 3. Result

Your demo will be live at `https://your-project.vercel.app`

---

## Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from dashboard folder
cd dashboard
vercel

# Follow prompts. When asked for root directory, confirm it's . (current folder)
```

---

## Configuration

The `dashboard/vercel.json` includes:

- **SPA rewrites** — All routes (`/`, `/submit`, `/analysis`) serve `index.html` for client-side routing
- **Vite build** — Standard `npm run build` output to `dist`

---

## Demo Mode on Vercel

- **Demo Mode is ON by default** — No API calls, works fully standalone
- Users can toggle Demo Mode off, but without a backend it will show "Disconnected"
- To use the real API: deploy the FastAPI backend separately (e.g. Railway, Render) and set the API URL

---

## Environment Variables

Not required for demo deployment. The app uses simulated data.

If you add a backend later, you could add:
- `VITE_API_URL` — Backend API URL (if you build with env support)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | Ensure `vercel.json` rewrites are present |
| Build fails | Check Root Directory is set to `dashboard` |
| Blank page | Verify `dist/index.html` exists after build |
