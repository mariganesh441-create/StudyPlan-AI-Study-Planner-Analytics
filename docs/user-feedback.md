# User Feedback & Product Methodology – StudyPlan AI

## 1. Problem Space & Academic Context
Modern university students and competitive exam aspirants face significant cognitive overload:
- **Fragmented Materials**: Syllabus documents in PDFs, exam timetables on college portals, and study notes in disconnected folders.
- **Unrealistic Planning**: Traditional calendar tools fail to account for topic difficulty, progress gaps, or cognitive fatigue.
- **Burnout After Falling Behind**: Missing a single study day often cascades into complete schedule abandonment because static timetables cannot re-balance themselves.
- **Dark Mode Concentration**: Late-night study sessions require low-glare interfaces with high text contrast and zero visual noise.

---

## 2. Design Rationale & Principles

### 2.1 Low-Distraction Dark Ergonomics
- **Background Canvas**: Deep midnight navy `#0B1020` minimizes photopic glare during extended evening and late-night study sessions.
- **Card Surfaces**: High-contrast slate navy `#111728` with subtle `#1E293B` borders creates clear structural definition without harsh dividing lines.
- **Semantic Accents**:
  - Violet `#7C3AED`: High-focus primary actions (e.g., plan generation, timer controls).
  - Teal `#2DD4BF`: Positive reinforcement for completed topics and maintained streaks.
  - Rose/Pink `#F472B6`: High-priority exam deadlines that demand immediate student attention.

### 2.2 Cognitive Load Management
- **Topic Time-Boxing**: Topics are broken into digestible 1.0 to 2.5 hour units.
- **Zero Promotional Artifacts**: No artificial marketing banners, upgrade prompts, or gamified clutter that distracts from study focus.
- **Immediate Utility**: Users land directly on actionable academic metrics and daily tasks without onboarding friction.

---

## 3. Product Evaluation Criteria

| Dimension | Evaluation Objective | Implementation Verification |
|:---|:---|:---|
| **Syllabus Granularity** | Support multi-unit topic tracking with status transitions | Fully interactive topic list with progress calculations |
| **Exam Urgency Alignment**| Automatically prioritize subjects with nearest deadlines | Verified with multi-tier exam urgency scoring engine |
| **Schedule Resiliency** | Recover gracefully when sessions are missed | Adaptive recovery slot allocator scans upcoming capacity |
| **Data Portability** | Guarantee student owns all academic data | One-click comprehensive JSON export and import |
| **Dual Persistence** | Zero-friction local demo + production PostgreSQL cloud sync | Supabase schema ready with automatic local demo fallback |

---

## 4. Product Roadmap & Future Horizons
1. **Flashcard & Spaced Repetition Integration**: Embedding SM-2 spaced repetition algorithms into topic review blocks.
2. **Google Classroom / Canvas LMS Sync**: One-click import of official university syllabi and assignment deadlines via OAuth.
3. **Collaborative Study Groups**: Shared syllabus tracking for study partners and project teams.
