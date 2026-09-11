# AI & Smart Interaction Audit – StudyPlan AI

## 1. Executive Summary
This document provides an audit of all automated heuristics, smart notification triggers, risk assessment algorithms, and analytical interactions built into StudyPlan AI.

---

## 2. Smart Notification & Alert Triggers

The application continuously evaluates study records and generates targeted in-app alerts across eight distinct categories:

| Alert Type | Trigger Condition | Severity / Category | Automated Action |
|:---|:---|:---|:---|
| **Exam Countdown** | Exam within 7, 3, or 1 calendar day(s) | `exam` (Rose badge) | Generates countdown alert with syllabus completion status |
| **Session Reminder** | 15–30 minutes prior to scheduled session start | `session` (Violet badge) | Displays focus block details and assigned syllabus topic |
| **Academic Risk** | Subject completion < expected timeline velocity | `risk` (Amber badge) | Recommends hour reallocation toward lagging topics |
| **Missed Session** | Scheduled study block marked as missed | `session` / `reschedule` | Proposes non-disruptive catch-up slot in upcoming days |
| **Goal Completed** | Goal reaches 100% progress target | `goal` (Teal badge) | Awards milestone badge and logs achievement in profile |
| **Study Streak** | Study session completed on consecutive days | `streak` (Amber badge) | Increments daily streak counter and triggers badge alert |
| **Performance Digest**| Weekly evaluation period completed | `report` (Blue badge) | Compiles weekly academic velocity audit and KPIs |
| **Task Deadline** | Uncompleted topic deadline imminent | `task` (Purple badge) | Highlights topic in Daily Tasks view |

---

## 3. Academic Risk Calculation

The risk engine classifies each subject into one of three risk states:
- **High Risk**:
  - Days to Exam $\le 14$ AND Syllabus Progress $< 50\%$
  - OR Days to Exam $\le 7$ AND Remaining Study Hours $> (\text{Days} \times \text{Daily Hours})$
- **Medium Risk**:
  - Days to Exam between 15 and 30 days AND Syllabus Progress $< 60\%$
  - OR Weekly study hours logged $< 50\%$ of target
- **On Track / Low Risk**:
  - Syllabus velocity meets or exceeds projected timeline to target grade.

---

## 4. Academic Velocity & Consistency Metrics

### 4.1 Consistency Score
Calculated as:
$$\text{Consistency} = \left(\frac{\text{Days with Completed Study Session}}{\text{Total Days in Period}}\right) \times 100$$
- Evaluated over 7-day, 30-day, and 90-day filter horizons.
- Students maintaining $> 80\%$ consistency are awarded the "Consistency Champion" badge.

### 4.2 Study Efficiency Score
Compares planned session duration against actual logged focus minutes:
$$\text{Efficiency} = \min\left(100, \text{round}\left(\frac{\text{Actual Focused Minutes}}{\text{Scheduled Duration Minutes}} \times 100\right)\right)$$

---

## 5. Audit of Built-in Testing & Simulation Tools
To support instructor and evaluator reviews:
1. **"Simulate Alert" Button** (`NotificationsView`): Generates verifiable sample academic notifications to demonstrate real-time badge updates and counter dynamics.
2. **"Generate Schedule" Engine** (`AiPlannerView`): Instantly produces a balanced 7-day or 14-day study plan with full time-slot allocations.
3. **"Reset Demo Data" Action** (`SettingsView`): Restores the comprehensive sample academic profile (Alex Kumar) with 5 subjects, 25 syllabus topics, 4 exams, 3 goals, and 30 days of logged study history.
