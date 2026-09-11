# AI & Algorithmic Workflow – StudyPlan AI

## 1. Algorithmic Study Planning Engine

StudyPlan AI uses a deterministic multi-factor academic scheduling engine (`src/lib/plannerAlgorithm.ts`). Rather than relying on non-deterministic black-box calls for basic calendar math, it computes optimal study schedules based on verifiable cognitive and academic parameters.

---

## 2. Priority Scoring Formula

Every registered subject is continuously evaluated and assigned a priority score between **0 and 100**:

```
Subject Priority Score = 
    Exam Urgency Factor (0 - 45 pts)
  + Progress Gap Factor (0 - 25 pts)
  + Difficulty Multiplier (0 - 15 pts)
  + Syllabus Backlog Factor (0 - 10 pts)
  + Weekly Deficit Factor (0 - 5 pts)
```

### 2.1 Exam Urgency Factor (Max 45 pts)
Calculated based on days remaining until the closest scheduled exam:
- $\le 3\text{ days}$: **45 points** (Critical Emergency)
- $4 - 5\text{ days}$: **40 points**
- $6 - 7\text{ days}$: **32 points**
- $8 - 14\text{ days}$: **24 points**
- $15 - 21\text{ days}$: **16 points**
- $22 - 30\text{ days}$: **10 points**
- $> 30\text{ days}$: **4 points**
- No exam scheduled: **0 points**

### 2.2 Progress Gap Factor (Max 25 pts)
Measures the distance between current knowledge/completion and target percentage:
$$\text{Gap} = \max(0, \text{Target \%} - \text{Current \%})$$
$$\text{Score} = \min\left(25, \text{round}\left(\frac{\text{Gap}}{100} \times 25\right)\right)$$

### 2.3 Difficulty Multiplier (Max 15 pts)
Reflects cognitive load:
- **Hard**: 15 points
- **Medium**: 9 points
- **Easy**: 4 points

### 2.4 Syllabus Backlog Factor (Max 10 pts)
Accounts for total estimated study hours remaining across uncompleted syllabus topics:
- $\ge 12\text{ hours}$: 10 points
- $8 - 11.9\text{ hours}$: 7 points
- $4 - 7.9\text{ hours}$: 4 points
- $< 4\text{ hours}$: 1 point

### 2.5 Weekly Target Deficit (Max 5 pts)
Compares hours studied in the rolling 7-day window against the subject's weekly target:
$$\text{Deficit} = \max(0, \text{Target Hours} - \text{Actual Logged Hours})$$
Points scale from 0 to 5 proportionally to the deficit.

---

## 3. Plan Generation Workflow

```
[Student Profile]
  - Daily Available Hours
  - Preferred Study Window (Morning/Evening)
        │
        ▼
[Subject Priorities] ──► [Uncompleted Topics Queue]
                             │
                             ▼
              [Date & Slot Allocator]
              - Maximum 2.5 hours per subject/day
              - Interleaved practice (spillover prevention)
              - Match preferred study time range
                             │
                             ▼
              [StudySession[] Output]
              - Session date & time
              - Specific assigned topic
              - Duration & status: "Scheduled"
```

1. **Input Normalization**: Reads student available hours per day (e.g. 4.0 hrs/day).
2. **Horizon Configuration**: Default 7-day or 14-day scheduling window.
3. **Queue Prioritization**: Subjects are sorted descending by Priority Score.
4. **Cognitive Interleaving**: To prevent burnout and fatigue, the algorithm caps any single subject to a maximum of 2.5 hours on a given calendar day, cycling through lower-priority subjects to provide balanced coverage.
5. **Slot Allocation**: Assigns time slots starting at the student's preferred start time (e.g. 18:00 to 22:00 for Evening preference).

---

## 4. Adaptive Rescheduling (Missed Session Recovery)

When a student marks a session as **"Missed"** or passes a deadline:
1. The session status is updated to `Missed`.
2. The remaining unfinished topic is returned to the active backlog queue.
3. The engine scans the upcoming 5 calendar days for available capacity (where scheduled hours < daily available hours).
4. An automated recovery slot is generated with an explanation badge (e.g. *"Catch-up for Algorithms: Graph Theory"*).
5. An in-app alert is generated in `NotificationsView` to inform the student of the recommended recovery slot.

---

## 5. What-If Scenario Simulations

The system allows students to simulate various study scenarios:
- **Scenario A: Exam Date Moved Up**: Re-calculates urgency scores and flags which topics must be condensed.
- **Scenario B: Study Hours Increased (+1 hr/day)**: Projects revised syllabus completion dates and estimated score gains.
- **Scenario C: Missed Sessions Accumulated**: Quantifies exam readiness risk and flags subjects transitioning into High Risk status.
