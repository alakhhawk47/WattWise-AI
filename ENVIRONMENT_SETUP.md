# Environment & Secrets Configuration Guide

This document outlines the environment variable configuration, secrets management best practices, and setup instructions for the **WattWise AI** project.

---

## 1. Project Structure

WattWise AI is structured as a decoupled monorepo containing a React + Vite frontend and a Python (FastAPI) backend:

```
WattWise-AI/
├── frontend/                 # React + Vite TypeScript Frontend
│   ├── .env                  # Local secret environment file (git-ignored)
│   ├── .env.example          # Environment template with placeholders only (tracked)
│   └── src/                  # Application source code
├── backend/                  # Python FastAPI Backend
│   ├── .gitignore            # Backend gitignore protecting secrets & build artifacts
│   └── app/                  # FastAPI service code
├── .gitignore                # Root git-ignore configuration
└── ENVIRONMENT_SETUP.md      # Environment documentation (this file)
```

---

## 2. Environment Files Overview

| Location | File | Purpose | Git Status |
| :--- | :--- | :--- | :--- |
| `frontend/` | `.env` | Active local environment variables & secrets | **Ignored** (`.gitignore`) |
| `frontend/` | `.env.example` | Template for required frontend environment variables | **Tracked in Git** |
| `backend/` | `.gitignore` | Backend file exclusion rules | **Tracked in Git** |
| Root | `.gitignore` | Monorepo-level file exclusion rules | **Tracked in Git** |

---

## 3. Environment Variables Reference

### Frontend (`frontend/.env`)

All frontend variables must be prefixed with `VITE_` to be exposed to the Vite client bundle via `import.meta.env`.

| Variable Name | Required | Description | Example / Placeholder |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | Yes | The HTTPS URL of your Supabase project instance | `https://<project_id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | The client-side publishable (anon) API key for Supabase | `sb_publishable_...` |

> [!NOTE]
> In React + Vite applications, frontend environment variables are embedded into the client bundle at build time via `import.meta.env.VITE_*`. Never include database service role keys or server-only master secrets in `frontend/.env`.

### Backend (`backend/`)

The Python backend currently does not require external database or API secrets. If backend environment variables are added in the future:
- Create `backend/.env.example` with non-sensitive placeholder definitions.
- Keep `backend/.env` git-ignored at all times.

---

## 4. Local Setup Guide

Follow these steps to configure your local development environment:

### Step 1: Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Populate `frontend/.env` with your active Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_publishable_anon_key
   ```
4. Verify that `frontend/.env` is ignored by Git before committing:
   ```bash
   git check-ignore frontend/.env
   ```

---

## 5. Production Environment Configuration

When deploying the application to production hosting platforms (e.g., Vercel, Netlify, Render, AWS, Docker):

1. **Do NOT upload `.env` files to source control or server bundles.**
2. Set environment variables directly in your host platform dashboard:
   - **Vercel / Netlify**: Go to **Project Settings > Environment Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - **Docker**: Pass variables at build/run time via `--build-arg VITE_SUPABASE_URL=...` or Docker secret management.
3. Re-trigger a production build whenever frontend `VITE_` variables are changed.

---

## 6. Key Rotation & Security Policy

If a publishable key or secret is accidentally compromised:

1. **Rotate Keys in Supabase Console**:
   - Access **Supabase Dashboard > Project Settings > API**.
   - Generate a new publishable API key / token.
   - Revoke the old compromised key.
2. **Update Environment Configurations**:
   - Update local `frontend/.env`.
   - Update production environment variable settings on your hosting platform.
3. **Rebuild Application**:
   - Run `npm run build` to embed the updated keys into the frontend distribution.
4. **Git Verification**:
   - Run `git status` to ensure `.env` remains untracked.
   - Never commit API keys or secret tokens to Git repositories.
