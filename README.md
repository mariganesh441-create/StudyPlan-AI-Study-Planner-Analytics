# StudyPlan AI – AI Study Planner & Analytics

StudyPlan AI is an intelligent academic productivity and study planning application engineered for university students and competitive exam aspirants. It unifies syllabus tracking, exam countdowns, personalized time-blocked study scheduling, adaptive rescheduling for missed sessions, and longitudinal academic analytics into a focused workspace.

---

## Key Features

1. **Academic Dashboard**: High-level overview of weekly study hours, syllabus completion velocity, active consistency streaks, and upcoming exam countdowns.
2. **Curriculum & Syllabus Tracking**: Multi-unit topic tracking with granular completion statuses, estimated study durations, and real-time subject progress calculations.
3. **Exam Countdown & Readiness Tracker**: Timeline tracking of exams with target scores, weightings, urgency badges, and readiness indicators.
4. **Intelligent Study Planner Engine**: Deterministic multi-factor priority algorithm that evaluates exam urgency, progress gaps, topic difficulty, and weekly hour deficits to generate balanced study schedules.
5. **Adaptive Rescheduling**: Automatically detects missed study blocks and schedules non-disruptive catch-up sessions based on upcoming available capacity.
6. **Daily Tasks & Pomodoro Focus Timer**: Today's prioritized study blocks with integrated Pomodoro timer (focus/break cycles), efficiency tracking, and task completion logs.
7. **Academic Analytics & Velocity Reports**: Longitudinal analytics over 7-day, 30-day, and 90-day periods with consistency metrics, subject risk analysis, and weekly/monthly synthesis digests.
8. **Smart Notification Center**: In-app academic alerts for imminent exams, approaching study sessions, academic risk warnings, and milestone badges.
9. **Student Profile & Time Budget Preferences**: Configurable study windows (Morning, Afternoon, Evening, Late Night), daily available hours, target GPA, and weekly target goals.
10. **Dual Persistence & Data Portability**: Instant offline-capable local state with full JSON export/import and production-ready Supabase PostgreSQL schema with Row Level Security.

---

## Design System

Designed specifically for sustained cognitive focus and late-night study ergonomics:
- **Background Canvas**: `#0B1020` (Deep Midnight Navy)
- **Card Surfaces**: `#111728` (Slate Navy)
- **Borders & Dividers**: `slate-800` (`#1E293B`)
- **Primary Accent**: `#7C3AED` (Violet-600)
- **Success & Completion**: `#2DD4BF` (Teal-400)
- **Deadlines & Urgent Exams**: `#F472B6` (Pink-400) / Rose-400
- **Typography**: Inter with tabular numbers for timers and KPIs

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Study velocity, subject mastery, efficiency trends)
- **Backend & Database**: Supabase / PostgreSQL with Row Level Security (RLS)
- **Local Persistence**: Client-side storage fallback with zero-configuration demo dataset

---

## Directory Structure

```
├── docs/                           # Comprehensive technical documentation
│   ├── architecture.md             # System architecture & component hierarchy
│   ├── ai-workflow.md              # Study planner algorithm & priority scoring
│   ├── ai-interaction-audit.md     # Smart triggers & risk calculation audit
│   ├── database.md                 # Database schema, ERD, and RLS policies
│   ├── testing.md                  # Testing matrix, benchmarks, & evaluation checklist
│   └── user-feedback.md            # UX rationale, ergonomics, & product roadmap
├── src/
│   ├── components/
│   │   ├── common/                 # Logo, timer modal, shared UI components
│   │   └── layout/                 # Responsive Sidebar and Header navigation
│   ├── context/
│   │   └── AppContext.tsx          # Global domain state management
│   ├── lib/
│   │   ├── analyticsEngine.ts      # Consistency, efficiency, and report algorithms
│   │   ├── initialData.ts          # Comprehensive sample student dataset (Alex Kumar)
│   │   ├── plannerAlgorithm.ts     # Multi-factor study planning algorithm
│   │   ├── supabase.ts             # Supabase client and sync helpers
│   │   └── utils.ts                # Formatting and utility functions
│   ├── views/                      # Application view controllers (10 tabs)
│   │   ├── AiPlannerView.tsx       # AI Study Planner & schedule generator
│   │   ├── AnalyticsView.tsx       # Academic analytics & charts
│   │   ├── CalendarView.tsx        # Calendar schedule view
│   │   ├── DailyTasksView.tsx      # Daily tasks & Pomodoro timer
│   │   ├── DashboardView.tsx       # Main academic dashboard
│   │   ├── ExamsView.tsx           # Exam countdown & tracker
│   │   ├── GoalsView.tsx           # Academic goals & milestones
│   │   ├── NotificationsView.tsx   # In-app notifications & alerts
│   │   ├── ReportsView.tsx         # Weekly & monthly academic reports
│   │   ├── SettingsView.tsx        # Student preferences & data export
│   │   ├── SubjectsView.tsx        # Subject cards & progress
│   │   └── SyllabusView.tsx        # Granular syllabus breakdown
│   ├── types.ts                    # Global TypeScript domain definitions
│   ├── App.tsx                     # Main layout controller
│   └── main.tsx                    # Application entry point
├── supabase/
│   └── schema.sql                  # PostgreSQL database migration & RLS policies
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or bun

### Installation
```bash
# Install project dependencies
npm install

# Start development server
npm run dev
```
The application will launch on `http://localhost:3000`.

### Type Checking
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## Database Configuration (Supabase PostgreSQL)

The application functions out of the box with built-in demo data. To connect your remote Supabase instance:
1. Create a project in [Supabase](https://supabase.com).
2. Open the SQL Editor in Supabase and execute `/supabase/schema.sql`.
3. Add your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the development server. The application will automatically synchronize with your cloud database.

---

## Documentation Index
- [System Architecture](docs/architecture.md)
- [AI Planner Algorithm & Workflow](docs/ai-workflow.md)
- [AI & Smart Interaction Audit](docs/ai-interaction-audit.md)
- [Database Schema & RLS Policies](docs/database.md)
- [Testing & Verification Matrix](docs/testing.md)
- [User Methodology & Roadmap](docs/user-feedback.md)
