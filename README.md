# Prereq Pilot

Prereq Pilot is a web application that helps students determine whether they meet prerequisite and GPA requirements for academic programs such as nursing, pre-health, and allied health tracks.

Students enter their academic history once and can instantly evaluate eligibility across multiple institutions and programs.

---

## 🚀 Core Features

### Current / MVP
- Student authentication
- Manual entry of coursework and grades
- Overall GPA calculation
- Program prerequisite matching
- Scenario simulation (what-if retakes or grade changes)

### Planned Platform Features
- Institution admin portal
- Institution-managed course catalogs
- Program & prerequisite publishing
- Program discovery and eligibility search
- Shareable eligibility reports
- CSV/PDF exports

---

## 🧩 Tech Stack

- **Next.js** — Full-stack React framework
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Supabase** — PostgreSQL database, auth, and storage
- **Vercel** — Hosting and serverless deployment

See `TECH_STACK.md` for detailed architecture and rationale.

---

## 🛠 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jamesl1500/prereqpilot.com.git
cd prereqpilot.com
npm install

### 3. Configure Environment Variables
Create a .env.local file in the root directory:

env
Copy code
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

Environment variables are required for authentication and database access.

### 4. Run the Development Server
bash
Copy code
npm run dev
Visit: http://localhost:3000

🗄️ Database & Supabase Setup
Create a Supabase project

Run SQL migrations (found in /supabase or provided separately)

Enable Row Level Security (RLS)

Seed initial institutions and programs (optional)

📁 Project Structure
csharp
Copy code
├─ app/                 # Next.js App Router
├─ components/          # Reusable UI components
├─ lib/                 # Utilities (Supabase client, GPA logic)
├─ supabase/            # SQL migrations & schema
├─ public/              # Static assets
├─ styles/              # Global styles
├─ TECH_STACK.md
├─ README.md
└─ package.json
🧪 Testing (Planned)

Unit tests for GPA and matching logic

Integration tests for program eligibility flows

End-to-end tests for critical user paths

### 🤝 Contributing
Contributions are welcome.

Fork the repo

Create a feature branch

Commit changes with clear messages

Open a pull request

Please add tests for any core logic changes.

### 📜 License
MIT License

### 📬 Contact
Maintained by James Latten
Use GitHub Issues for bugs, feature requests, or discussions.

yaml
Copy code

---

### ✅ Next optional files I can generate for you
- `CONTRIBUTING.md`
- `ARCHITECTURE.md` (system diagrams + flows)
- Supabase **RLS policy SQL**
- API contract / endpoint spec
- Institution Admin onboarding guide

Just tell me which one you want next.