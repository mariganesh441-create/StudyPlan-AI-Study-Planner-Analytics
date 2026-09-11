# System Architecture – StudyPlan AI

## 1. Overview
**StudyPlan AI** is an intelligent academic productivity and study planning application designed for students and researchers. It coordinates syllabus tracking, exam countdowns, personalized time-blocked study scheduling, adaptive rescheduling for missed sessions, and longitudinal academic performance analytics.

The application adheres strictly to a high-concentration, distraction-free design system:
- **Default Dark Workspace**: Canvas `#0B1020` and elevated card surfaces `#111728`.
- **Primary Brand**: `#7C3AED` (Violet-600) for focal actions and interactive elements.
- **Academic State Semantics**: Teal (`#2DD4BF`) for completion/success, Amber (`#F59E0B`) for warnings/risks, and Pink/Rose (`#F472B6`) for critical deadlines/exams.
- **Zero Distraction Policy**: No promotional popups, no artificial hero banners, and no fake telemetry.

---

## 2. Frontend Layer (React 19 + TypeScript + Vite)

### 2.1 View Hierarchy & Navigation
The application operates on a single-page architecture governed by a responsive layout shell (`Sidebar.tsx`, `Header.tsx`, and `App.tsx`):

```
                       ┌───────────────────────┐
                       │     App Component     │
                       └──────────┬────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
┌────────┴────────┐                               ┌────────┴────────┐
│  Sidebar & Nav  │                               │ Header Bar & UI │
│ (10 Tab Routes) │                               │ (Quick Add, etc)│
└─────────────────┘                               └─────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Active View Container                    │
├───────────────────┬───────────────────┬──────────────────────────┤
│ 1. Dashboard      │ 2. Subjects       │ 3. Syllabus & Topics     │
│ 4. Exams Tracker  │ 5. Goals          │ 6. AI Study Planner      │
│ 7. Daily Tasks    │ 8. Calendar View  │ 9. Academic Analytics    │
│ 10. Reports       │ 11. Notifications │ 12. Settings & Backup    │
└───────────────────┴───────────────────┴──────────────────────────┘
```

### 2.2 Global State Management (`AppContext.tsx`)
All core domain models are managed through a centralized React Context with real-time propagation:
- **`StudentProfile`**: Institution, semester, target GPA, daily available hours, preferred study windows (Morning, Afternoon, Evening, Late Night).
- **`Subject[]`**: Academic disciplines with knowledge levels, target percentages, exam targets, and weekly target hours.
- **`Topic[]`**: Granular syllabus breakdown with order indices, estimated durations, and completion states.
- **`Exam[]`**: Scheduled examinations with syllabus weightings, target scores, priorities, and countdowns.
- **`StudySession[]`**: Scheduled time blocks with completion statuses, actual durations, topics studied, and rescheduling metadata.
- **`DailyProgress[]`**: Longitudinal logs of daily study minutes, completed topics, and focus ratings.
- **`Goal[]`**: Academic milestones, grade goals, and consistency targets.
- **`NotificationItem[]`**: Dynamic alerts generated on milestones, upcoming exams, missed sessions, and syllabus risks.

---

## 3. Algorithmic Core (`plannerAlgorithm.ts` & `analyticsEngine.ts`)

1. **Multi-Factor Priority Scoring**:
   $$P_{\text{subject}} = S_{\text{exam\_urgency}} + S_{\text{gap}} + S_{\text{difficulty}} + S_{\text{backlog}} + S_{\text{weekly\_deficit}}$$
2. **Deterministic Schedule Synthesis**:
   Iterates through user-defined daily available hours, maps topic backlog against exam dates, respects preferred study periods, and prevents cognitive fatigue via distributed scheduling.
3. **Adaptive Missed-Session Recovery**:
   When a session is marked missed, the algorithm detects available free slots in upcoming days and suggests non-disruptive catch-up blocks.
4. **Longitudinal Academic Velocity**:
   Computes consistency scores, topic completion rates, syllabus risk metrics, and study efficiency metrics over 7-day, 30-day, and 90-day rolling horizons.

---

## 4. Backend & Data Layer (Supabase / PostgreSQL)

The system supports dual-mode persistence:
1. **Cloud Persistence (Supabase PostgreSQL)**:
   - Full schema with 9 interrelated relational tables.
   - Row Level Security (RLS) policies enforcing strict `auth.uid() = user_id` isolation.
   - Database triggers for auto-updating timestamps.
2. **Local Persistence (Zero-Config Offline Fallback)**:
   - Automated local synchronization with sample student dataset (Alex Kumar, Computer Science Semester 5).
   - Allows instant evaluation without requiring external credentials.
   - Full JSON export and import capabilities for data portability.

---

## 5. Security Architecture
- **Row Level Security**: Every SQL table has RLS enabled with explicit SELECT, INSERT, UPDATE, and DELETE policies scoped to authenticated user IDs.
- **No Secret Exposure**: Supabase anon keys are public-safe; all privileged operations require user JWT validation.
- **Client Sanitization**: All form inputs, durations, and percentages are strictly typed, bounded, and validated.
