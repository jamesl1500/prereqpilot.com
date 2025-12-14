# Prereq Pilot — Tech Stack

Prereq Pilot is a full-stack web platform that helps students evaluate academic eligibility for programs (e.g., nursing, pre-health) by matching completed coursework against institution-defined prerequisite requirements.

This document outlines the technologies used, architectural decisions, and the rationale behind them.

---

## 🏗️ Architecture Overview

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Backend Style:** Serverless (API routes / Server Actions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Hosting:** Vercel
- **Infrastructure Pattern:** Role-based, multi-tenant SaaS

---

## 🎨 Frontend Stack

### Next.js
- App Router for routing and layouts
- Server Components for data fetching
- Client Components for interactive UI
- API routes / Server Actions for backend logic

### TypeScript
- End-to-end type safety
- Shared types between frontend and backend
- Reduced runtime errors and clearer contracts

### Styling
- **Tailwind CSS** for utility-first styling
- Optional: **shadcn/ui** for accessible component primitives

---

## 🗄️ Backend & Data Layer

### Supabase
Used as the primary backend platform:
- PostgreSQL database
- Authentication & session management
- Row Level Security (RLS)
- Storage (future: PDFs, CSV uploads)

### Database Design
Relational schema supports:
- Students and transcripts
- Institutions and course catalogs
- Programs and versioned prerequisite requirements
- Scenario simulations (what-if GPA calculations)
- Role-based institution administration

---

## 🔐 Authentication & Authorization

- Supabase Auth (email/password + OAuth ready)
- Row Level Security (RLS) enforces:
  - Students only access their own data
  - Institution admins manage only their institution content
  - Public read access to published programs

---

## 🔌 API & Server Logic

- Implemented using Next.js API routes or Server Actions
- Responsibilities include:
  - GPA calculations
  - Requirement matching
  - Scenario simulations
  - Program eligibility evaluation

---

## 📦 Tooling & Dev Experience

- **ESLint** – code linting
- **Prettier** – formatting
- **GitHub Actions** (optional) – CI/CD
- **Jest / Playwright** (planned) – testing

---

## 🚀 Deployment

- **Frontend + API:** Vercel
- **Database + Auth:** Supabase
- **Environment Variables:** Managed via Vercel & Supabase dashboards

---

## 🧠 Why This Stack?

This stack was chosen for:
- Fast iteration and MVP velocity
- Minimal infrastructure overhead
- Full TypeScript coverage
- Clear upgrade path to a production SaaS platform

---

## 🔮 Future Enhancements

- Stripe billing & subscriptions
- Background jobs (PDF exports, batch imports)
- Course equivalency mapping between institutions
- Advanced analytics & reporting