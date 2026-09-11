# Testing & Verification Matrix – StudyPlan AI

## 1. Overview
This document outlines the testing strategy, edge-case validations, algorithmic verification cases, and evaluation procedures implemented in StudyPlan AI.

---

## 2. Automated Type Safety & Static Analysis
- **TypeScript Compiler**: Validated with `tsc --noEmit` across strict mode flags.
- **Zero Type Coercion Defects**: Strict interface typing across all 9 domain models (`types.ts`).
- **CSS Utility Check**: Tailwind CSS classes checked and verified against standard utility definitions.

---

## 3. Algorithmic Test Cases & Verification

### 3.1 Exam Urgency Scoring Boundary Tests
| Scenario | Days to Exam | Expected Points | Verification Status |
|:---|:---:|:---:|:---:|
| Imminent Exam (Emergency) | 2 days | 45 pts | Passed |
| Imminent Exam (Threshold) | 3 days | 45 pts | Passed |
| Critical Window | 5 days | 40 pts | Passed |
| Near Horizon | 7 days | 32 pts | Passed |
| Intermediate Horizon | 14 days | 24 pts | Passed |
| Far Horizon | 28 days | 10 pts | Passed |
| Distant Exam | 45 days | 4 pts | Passed |
| No Exam Scheduled | N/A | 0 pts | Passed |

### 3.2 Difficulty & Progress Gap Multiplier Tests
| Subject Condition | Target % | Current % | Difficulty | Expected Gap pts | Expected Difficulty pts | Total Sub-Score |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Algorithms (High Gap, Hard) | 90% | 40% | Hard | 13 pts (50% gap) | 15 pts | 28 pts |
| Database (Low Gap, Med) | 85% | 75% | Medium | 3 pts (10% gap) | 9 pts | 12 pts |
| Web Dev (Zero Gap, Easy) | 80% | 85% | Easy | 0 pts (exceeded) | 4 pts | 4 pts |

### 3.3 Study Plan Cognitive Load Caps
- **Rule**: No subject may exceed 2.5 hours on a single calendar day.
- **Verification**: When a user inputs 5.0 hours/day available time, the algorithm schedules a maximum 2.5-hour block for the highest-priority subject, and distributes the remaining 2.5 hours to the second and third priority subjects.
- **Interleaving Verification**: Verifies that topics from different subjects alternate rather than clustering single subjects for multiple days in a row.

### 3.4 Missed Session Rescheduling Recovery
- **Rule**: When session $S_1$ is marked `Missed`, topic $T_1$ must be re-queued, and an alternative slot must be identified within 5 days without exceeding daily available hours.
- **Verification**: Tested with multiple missed session scenarios; recovery blocks are assigned with status `Scheduled` and recovery note.

---

## 4. Manual Evaluation Checklist for Reviewers

Reviewers can execute the following verification steps directly in the preview:

1. **Dashboard & Summary View**:
   - Verify KPI cards (Weekly Study Hours, Overall Syllabus, Active Streak, Exams Pending).
   - Check exam countdown cards displaying live day counts.
   - Verify Subject Readiness matrix and risk flags.

2. **Subjects & Syllabus Management**:
   - Add a new subject with custom target percentage and difficulty.
   - Expand subject syllabus topics; toggle a topic between `Pending`, `In Progress`, and `Completed`.
   - Observe real-time progress bar updates on the subject card.

3. **AI Study Planner (`AiPlannerView`)**:
   - Adjust daily available hours (e.g. 4.0 hrs) and horizon (7 or 14 days).
   - Click **"Generate Study Plan"**.
   - Verify that generated sessions are ordered logically, time slots match student preferences, and topic durations match syllabus estimates.

4. **Daily Tasks & Focus Timer (`DailyTasksView`)**:
   - Open a scheduled task; launch the Pomodoro Focus Timer modal.
   - Test start/pause/reset timer operations.
   - Mark a task as completed or missed; observe task completion counter update.

5. **Academic Reports (`ReportsView`)**:
   - Switch between **Weekly Velocity Report** and **Monthly Performance Audit**.
   - Verify dynamic calculation of study velocity, strongest/weakest subject analysis, and syllabus risk recommendations.

6. **Smart Notifications (`NotificationsView`)**:
   - Click **"Simulate Alert"**; observe real-time notification card addition and badge increment.
   - Filter by categories (*Exams & Deadlines*, *Sessions & Tasks*, *Risks & Reports*).
   - Click **"Mark All as Read"**.

7. **Data Portability (`SettingsView`)**:
   - Click **"Export All Academic Data (JSON)"** to download the complete student archive.
   - Click **"Reset Demo Data"** to restore pristine evaluation records.
