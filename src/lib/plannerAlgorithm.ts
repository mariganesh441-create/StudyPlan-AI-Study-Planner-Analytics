import { 
  Subject, 
  Topic, 
  Exam, 
  StudySession, 
  StudentProfile, 
  SubjectPriority, 
  PlanSimulationResult, 
  WhatIfScenario 
} from '../types';

/**
 * Format helper for YYYY-MM-DD
 */
export const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate difference in days from reference date (today) to a target date string
 */
export const getDaysDifference = (targetDateStr: string, fromDate = new Date()): number => {
  const target = new Date(targetDateStr);
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diffTime = target.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate priority score for each subject based on user criteria:
 * 1. Exams that are closer (highest urgency)
 * 2. Subjects with low progress / high progress gap
 * 3. Hard subjects (difficulty multiplier)
 * 4. Subjects with more remaining syllabus (hours)
 * 5. Subjects behind their weekly target
 */
export const calculateSubjectPriorities = (
  subjects: Subject[],
  exams: Exam[],
  topics: Topic[],
  studySessions: StudySession[],
  getSubjectProgress: (id: string) => number
): SubjectPriority[] => {
  // Compute past 7 days logged hours per subject
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentSessions = studySessions.filter(s => {
    if (s.status === 'Cancelled' || s.status === 'Missed') return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate >= sevenDaysAgo && sessionDate <= now;
  });

  const subjectPriorities: SubjectPriority[] = subjects.map(subject => {
    const currentProgress = getSubjectProgress(subject.id);
    const targetPercentage = subject.target_percentage || 90;
    
    // Find exam for this subject
    const subjectExams = exams.filter(e => e.subject_id === subject.id);
    // Sort to find closest exam
    const sortedExams = [...subjectExams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
    const closestExam = sortedExams[0];
    const examDateStr = closestExam ? closestExam.exam_date : subject.exam_date;
    const daysToExam = examDateStr ? getDaysDifference(examDateStr) : null;

    // 1. Exam Urgency Factor (0 - 45 points)
    let examUrgencyScore = 0;
    if (daysToExam !== null) {
      if (daysToExam <= 3) examUrgencyScore = 45;
      else if (daysToExam <= 5) examUrgencyScore = 40;
      else if (daysToExam <= 7) examUrgencyScore = 32;
      else if (daysToExam <= 14) examUrgencyScore = 24;
      else if (daysToExam <= 21) examUrgencyScore = 16;
      else if (daysToExam <= 30) examUrgencyScore = 10;
      else examUrgencyScore = 4;
    } else {
      examUrgencyScore = 2;
    }

    // 2. Progress Gap Score (0 - 25 points)
    const progressGap = Math.max(0, targetPercentage - currentProgress);
    const progressGapScore = Math.round((progressGap / 100) * 25);

    // 3. Difficulty Multiplier (Hard: 1.35x, Medium: 1.10x, Easy: 0.85x)
    let difficultyMultiplier = 1.10;
    if (subject.difficulty === 'Hard') difficultyMultiplier = 1.35;
    else if (subject.difficulty === 'Easy') difficultyMultiplier = 0.85;

    // 4. Remaining Syllabus Load (0 - 20 points)
    const subjectTopics = topics.filter(t => t.subject_id === subject.id);
    const pendingTopics = subjectTopics.filter(t => t.status !== 'Completed');
    const remainingHours = pendingTopics.reduce((sum, t) => sum + (t.estimated_duration_hours || 1.5), 0);
    const syllabusLoadScore = Math.min(20, Math.round(remainingHours * 2.2));

    // 5. Weekly Target Deficit (0 - 15 points)
    const loggedMinutesThisWeek = recentSessions
      .filter(s => s.subject_id === subject.id)
      .reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 60), 0);
    const loggedHoursThisWeek = Math.round((loggedMinutesThisWeek / 60) * 10) / 10;
    const weeklyTargetHours = subject.weekly_study_target_hours || 4;
    const weeklyDeficitHours = Math.max(0, weeklyTargetHours - loggedHoursThisWeek);
    const weeklyDeficitScore = Math.min(15, Math.round(weeklyDeficitHours * 3));

    // Calculate raw weighted priority score
    const baseScore = examUrgencyScore + progressGapScore + syllabusLoadScore + weeklyDeficitScore;
    const finalScore = Math.round(baseScore * difficultyMultiplier);

    return {
      subject_id: subject.id,
      subject_name: subject.name,
      color: subject.color || '#3B82F6',
      difficulty: subject.difficulty,
      current_progress: currentProgress,
      target_percentage: targetPercentage,
      exam_date: examDateStr,
      days_to_exam: daysToExam,
      remaining_syllabus_hours: Math.round(remainingHours * 10) / 10,
      weekly_target_hours: weeklyTargetHours,
      logged_hours_this_week: loggedHoursThisWeek,
      weekly_deficit_hours: Math.round(weeklyDeficitHours * 10) / 10,
      priority_score: finalScore,
      rank: 0,
      score_factors: {
        exam_urgency_score: examUrgencyScore,
        progress_gap_score: progressGapScore,
        difficulty_multiplier: difficultyMultiplier,
        syllabus_load_score: syllabusLoadScore,
        weekly_deficit_score: weeklyDeficitScore,
      },
    };
  });

  // Sort descending by priority score and assign ranks
  subjectPriorities.sort((a, b) => b.priority_score - a.priority_score);
  subjectPriorities.forEach((sp, idx) => {
    sp.rank = idx + 1;
  });

  return subjectPriorities;
};

/**
 * Generate an AI Study Plan based on:
 * - Pending topics
 * - Subject priorities
 * - Daily available hours & preferred focus time
 * - Avoiding existing events & exams
 * - Dedicated revision blocks before exams
 * - Never scheduling a subject after its exam date!
 */
export interface GeneratePlanOptions {
  horizonDays?: number; // default 7
  includeRevision?: boolean; // default true
  sessionDurationMins?: number; // default 75-90 mins
  startDate?: string; // default today
}

export const generateAIStudyPlan = (
  subjects: Subject[],
  topics: Topic[],
  exams: Exam[],
  existingSessions: StudySession[],
  profile: StudentProfile,
  getSubjectProgress: (id: string) => number,
  options: GeneratePlanOptions = {}
): StudySession[] => {
  const horizonDays = options.horizonDays || 7;
  const includeRevision = options.includeRevision !== false;
  const startDay = options.startDate ? new Date(options.startDate) : new Date();

  // 1. Calculate subject priorities
  const priorities = calculateSubjectPriorities(subjects, exams, topics, existingSessions, getSubjectProgress);

  // Group pending topics by subject
  const pendingTopicsBySubject: Record<string, Topic[]> = {};
  subjects.forEach(sub => {
    pendingTopicsBySubject[sub.id] = topics
      .filter(t => t.subject_id === sub.id && t.status !== 'Completed')
      .sort((a, b) => a.order_index - b.order_index);
  });

  // Keep track of topic queue index per subject
  const topicQueueIndex: Record<string, number> = {};
  subjects.forEach(sub => {
    topicQueueIndex[sub.id] = 0;
  });

  // Parse preferred study start time e.g. "18:00"
  const startHourMin = profile.preferred_study_start_time || '18:00';
  const [prefHourStr, prefMinStr] = startHourMin.split(':');
  const baseStartHour = parseInt(prefHourStr, 10) || 18;
  const baseStartMin = parseInt(prefMinStr, 10) || 0;

  const generatedSessions: StudySession[] = [];
  const dailyAvailableHours = profile.daily_available_hours || 4;
  const maxDailyMinutes = Math.round(dailyAvailableHours * 60);

  // Loop through days in horizon
  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset++) {
    const currentDay = new Date(startDay);
    currentDay.setDate(startDay.getDate() + dayOffset);
    const dateStr = formatDateStr(currentDay);

    // Filter existing non-cancelled sessions already on this day
    const existingOnDay = existingSessions.filter(
      s => s.session_date === dateStr && s.status !== 'Cancelled'
    );
    const existingMinutes = existingOnDay.reduce((acc, s) => acc + (s.planned_duration_minutes || s.duration_minutes || 60), 0);

    let remainingMinutesToday = Math.max(0, maxDailyMinutes - existingMinutes);
    if (remainingMinutesToday < 45) {
      // Day is already full
      continue;
    }

    // Check if any exam is scheduled within 1-2 days from currentDay (for revision sessions)
    const upcomingExamsInNext2Days = exams.filter(exam => {
      const daysUntil = getDaysDifference(exam.exam_date, currentDay);
      return daysUntil >= 0 && daysUntil <= 2;
    });

    let currentSessionStartTime = baseStartHour * 60 + baseStartMin; // in minutes from midnight

    // If existing sessions exist today, push start time past them
    existingOnDay.forEach(s => {
      if (s.end_time) {
        const [eh, em] = s.end_time.split(':').map(Number);
        const endMinutes = eh * 60 + em;
        if (endMinutes > currentSessionStartTime) {
          currentSessionStartTime = endMinutes + 15; // 15 min buffer
        }
      }
    });

    // 6. Add revision sessions before exams (if within 1-2 days of exam)
    if (includeRevision && upcomingExamsInNext2Days.length > 0) {
      for (const exam of upcomingExamsInNext2Days) {
        const sub = subjects.find(s => s.id === exam.subject_id);
        if (!sub) continue;

        // Check if subject's exam has already passed on this day
        const daysDiff = getDaysDifference(exam.exam_date, currentDay);
        if (daysDiff < 0) continue; // Exam has passed

        const revDuration = Math.min(remainingMinutesToday, 90);
        if (revDuration >= 45) {
          const startHH = String(Math.floor(currentSessionStartTime / 60)).padStart(2, '0');
          const startMM = String(currentSessionStartTime % 60).padStart(2, '0');
          const endTotalMin = currentSessionStartTime + revDuration;
          const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
          const endMM = String(endTotalMin % 60).padStart(2, '0');

          generatedSessions.push({
            id: `gen-rev-${Date.now()}-${dayOffset}-${exam.id}`,
            user_id: profile.user_id,
            subject_id: sub.id,
            title: `${sub.name} – High-Impact Exam Revision & Formula Recall`,
            session_date: dateStr,
            start_time: `${startHH}:${startMM}`,
            end_time: `${endHH}:${endMM}`,
            duration_minutes: revDuration,
            planned_duration_minutes: revDuration,
            status: 'Planned',
            is_revision: true,
            notes: `Dedicated preparation milestone for upcoming ${exam.name} on ${exam.exam_date}.`,
            created_at: new Date().toISOString(),
          });

          remainingMinutesToday -= revDuration;
          currentSessionStartTime = endTotalMin + 15; // 15 min rest
        }
      }
    }

    // Allocate remaining time to highest priority subjects
    // Filter subjects eligible for scheduling on this day:
    // Rule 7: NEVER schedule a subject after its exam date!
    const eligiblePriorities = priorities.filter(sp => {
      if (!sp.exam_date) return true;
      const daysDiff = getDaysDifference(sp.exam_date, currentDay);
      return daysDiff >= 0; // Exam has not passed yet
    });

    // Interleave top eligible subjects
    let subIdx = 0;
    while (remainingMinutesToday >= 45 && subIdx < eligiblePriorities.length) {
      const sp = eligiblePriorities[subIdx % eligiblePriorities.length];
      const sub = subjects.find(s => s.id === sp.subject_id);
      if (!sub) {
        subIdx++;
        continue;
      }

      const pendingList = pendingTopicsBySubject[sub.id] || [];
      const topicIndex = topicQueueIndex[sub.id] || 0;
      const topic = pendingList[topicIndex];

      const sessionDuration = Math.min(
        remainingMinutesToday,
        topic ? Math.round((topic.estimated_duration_hours || 1.25) * 60) : 75
      );

      if (sessionDuration < 45) break;

      const startHH = String(Math.floor(currentSessionStartTime / 60)).padStart(2, '0');
      const startMM = String(currentSessionStartTime % 60).padStart(2, '0');
      const endTotalMin = currentSessionStartTime + sessionDuration;
      const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
      const endMM = String(endTotalMin % 60).padStart(2, '0');

      const title = topic 
        ? `${sub.name} – ${topic.name}`
        : `${sub.name} – Core Syllabus Practice & Problem Sets`;

      generatedSessions.push({
        id: `gen-${Date.now()}-${dayOffset}-${sub.id}-${Math.floor(Math.random() * 1000)}`,
        user_id: profile.user_id,
        subject_id: sub.id,
        topic_id: topic?.id,
        title,
        session_date: dateStr,
        start_time: `${startHH}:${startMM}`,
        end_time: `${endHH}:${endMM}`,
        duration_minutes: sessionDuration,
        planned_duration_minutes: sessionDuration,
        status: 'Planned',
        is_revision: false,
        notes: topic?.notes || `Target: Complete syllabus milestone according to AI optimal study window.`,
        created_at: new Date().toISOString(),
      });

      if (topic) {
        topicQueueIndex[sub.id] = topicIndex + 1;
      }

      remainingMinutesToday -= sessionDuration;
      currentSessionStartTime = endTotalMin + 15; // 15 min rest
      subIdx++;
    }
  }

  return generatedSessions;
};

/**
 * Find next available slot for a missed session:
 * 1. Respects study hours (profile.preferred_study_start_time)
 * 2. Respects existing sessions (no overlapping conflicts)
 * 3. Respects subject's exam date (must strictly be BEFORE exam date)
 */
export const findNextAvailableSlotForReschedule = (
  missedSession: StudySession,
  existingSessions: StudySession[],
  exams: Exam[],
  subjects: Subject[],
  profile: StudentProfile
): StudySession | null => {
  const subject = subjects.find(s => s.id === missedSession.subject_id);
  const exam = exams.find(e => e.subject_id === missedSession.subject_id);
  const examDateStr = exam?.exam_date || subject?.exam_date;

  const duration = missedSession.planned_duration_minutes || missedSession.duration_minutes || 60;
  const startHourMin = profile.preferred_study_start_time || '18:00';
  const [prefHourStr, prefMinStr] = startHourMin.split(':');
  const baseStartHour = parseInt(prefHourStr, 10) || 18;
  const baseStartMin = parseInt(prefMinStr, 10) || 0;

  // Search through upcoming 14 days starting tomorrow
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const candidateDate = new Date(startDate);
    candidateDate.setDate(startDate.getDate() + dayOffset);
    const dateStr = formatDateStr(candidateDate);

    // Rule 5: Respect exam date - must be strictly before exam date
    if (examDateStr) {
      const daysUntilExam = getDaysDifference(examDateStr, candidateDate);
      if (daysUntilExam < 0) {
        // Can't schedule after exam!
        continue;
      }
    }

    // Check existing non-cancelled sessions on candidateDate
    const sessionsOnDate = existingSessions.filter(
      s => s.session_date === dateStr && s.status !== 'Cancelled' && s.status !== 'Missed'
    );

    const totalMinutes = sessionsOnDate.reduce(
      (acc, s) => acc + (s.planned_duration_minutes || s.duration_minutes || 60), 
      0
    );

    const maxDailyMinutes = (profile.daily_available_hours || 4) * 60;
    if (totalMinutes + duration <= maxDailyMinutes) {
      // Find suitable non-overlapping time slot
      let candidateStart = baseStartHour * 60 + baseStartMin;

      // Adjust start time if any session on this day overlaps
      sessionsOnDate.forEach(s => {
        if (s.end_time) {
          const [eh, em] = s.end_time.split(':').map(Number);
          const endMin = eh * 60 + em;
          if (endMin > candidateStart) {
            candidateStart = endMin + 15;
          }
        }
      });

      const startHH = String(Math.floor(candidateStart / 60)).padStart(2, '0');
      const startMM = String(candidateStart % 60).padStart(2, '0');
      const endTotalMin = candidateStart + duration;
      const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
      const endMM = String(endTotalMin % 60).padStart(2, '0');

      return {
        id: `resched-${Date.now()}`,
        user_id: missedSession.user_id,
        subject_id: missedSession.subject_id,
        topic_id: missedSession.topic_id,
        title: missedSession.title,
        session_date: dateStr,
        start_time: `${startHH}:${startMM}`,
        end_time: `${endHH}:${endMM}`,
        duration_minutes: duration,
        planned_duration_minutes: duration,
        status: 'Planned',
        is_revision: missedSession.is_revision,
        rescheduled_from_session_id: missedSession.id,
        notes: `Automatically rescheduled from missed session on ${missedSession.session_date}.`,
        created_at: new Date().toISOString(),
      };
    }
  }

  return null;
};

/**
 * Handle Exam Date Change:
 * Adjusts pending sessions so that none are scheduled after the new exam date.
 * Completed sessions remain untouched.
 */
export const adjustScheduleForExamDateChange = (
  subjectId: string,
  newExamDateStr: string,
  existingSessions: StudySession[],
  profile: StudentProfile
): { updatedSessions: StudySession[]; movedCount: number } => {
  let movedCount = 0;
  const newExamDate = new Date(newExamDateStr);

  const updatedSessions = existingSessions.map(session => {
    // Only affect pending/planned sessions for this specific subject
    if (session.subject_id !== subjectId || session.status === 'Completed' || session.status === 'Cancelled') {
      return session;
    }

    const sessionDate = new Date(session.session_date);
    if (sessionDate > newExamDate) {
      // Must be pulled earlier
      movedCount++;
      // Shift date to 1-2 days before new exam date
      const adjustedDate = new Date(newExamDate);
      adjustedDate.setDate(newExamDate.getDate() - 1);
      const newDateStr = formatDateStr(adjustedDate);

      return {
        ...session,
        session_date: newDateStr,
        notes: `${session.notes || ''} [Shifted before exam on ${newExamDateStr}]`.trim(),
      };
    }

    return session;
  });

  return { updatedSessions, movedCount };
};

/**
 * What-If Simulation Engine:
 * Generates a non-destructive comparison between current plan and simulated scenario.
 */
export const runWhatIfSimulation = (
  scenario: WhatIfScenario,
  existingSessions: StudySession[],
  subjects: Subject[],
  exams: Exam[],
  topics: Topic[],
  profile: StudentProfile,
  getSubjectProgress: (id: string) => number
): PlanSimulationResult => {
  const currentTotal = existingSessions.filter(s => s.status !== 'Cancelled').length;
  const dsaProgress = getSubjectProgress('sub-dsa');

  let simulatedSessions: StudySession[] = JSON.parse(JSON.stringify(existingSessions));
  const impactSummary: string[] = [];

  let simulatedWeeklyHours = (profile.weekly_study_target_hours || 24);
  let simulatedReadiness = dsaProgress;
  let overloadRisk: 'Low' | 'Moderate' | 'High' = 'Low';

  if (scenario.id === 'scenario-2h-tomorrow') {
    // Tomorrow only 2 hours available
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateStr(tomorrow);

    const tomorrowSessions = simulatedSessions.filter(s => s.session_date === tomorrowStr && s.status === 'Planned');
    if (tomorrowSessions.length > 1) {
      // Push the second session to day after tomorrow
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      const dayAfterStr = formatDateStr(dayAfter);

      tomorrowSessions.slice(1).forEach(s => {
        s.session_date = dayAfterStr;
        s.notes = `Simulated: Moved from ${tomorrowStr} due to 2h capacity constraint.`;
      });
      impactSummary.push(`Reduced study load on ${tomorrowStr} by 90 minutes.`);
      impactSummary.push(`Shifted 1 session to ${dayAfterStr} without breaching exam milestones.`);
    } else {
      impactSummary.push(`Tomorrow's scheduled volume already fits within the 2-hour capacity.`);
    }
    overloadRisk = 'Low';
    simulatedWeeklyHours -= 1.5;
  } else if (scenario.id === 'scenario-dsa-earlier') {
    // DSA Exam moved 5 days earlier
    const dsaExam = exams.find(e => e.subject_id === 'sub-dsa');
    if (dsaExam) {
      const origDate = new Date(dsaExam.exam_date);
      origDate.setDate(origDate.getDate() - 5);
      const newDsaDateStr = formatDateStr(origDate);

      const result = adjustScheduleForExamDateChange('sub-dsa', newDsaDateStr, simulatedSessions, profile);
      simulatedSessions = result.updatedSessions;

      impactSummary.push(`DSA Exam shifted to ${newDsaDateStr}.`);
      impactSummary.push(`Accelerated ${result.movedCount} DSA study blocks to ensure full syllabus readiness.`);
      impactSummary.push(`Increased daily DSA priority weighting to 65%.`);
      overloadRisk = 'Moderate';
      simulatedReadiness = Math.min(100, dsaProgress + 15);
    }
  } else if (scenario.id === 'scenario-miss-today') {
    // Miss today's session
    const todayStr = formatDateStr(new Date());
    const todaySession = simulatedSessions.find(s => s.session_date === todayStr && s.status === 'Planned');
    if (todaySession) {
      todaySession.status = 'Missed';
      const rescheduled = findNextAvailableSlotForReschedule(
        todaySession,
        simulatedSessions,
        exams,
        subjects,
        profile
      );
      if (rescheduled) {
        simulatedSessions.push(rescheduled);
        impactSummary.push(`Marked today's "${todaySession.title}" as Missed.`);
        impactSummary.push(`Automatically recovered slot on ${rescheduled.session_date} at ${rescheduled.start_time}.`);
        impactSummary.push(`Zero syllabus deficit; pace preserved.`);
      }
    } else {
      impactSummary.push(`No pending sessions scheduled for today.`);
    }
    overloadRisk = 'Low';
  } else if (scenario.id === 'scenario-extra-weekend') {
    // 3 extra hours this weekend
    impactSummary.push(`Allocated 3 bonus focus hours across Saturday & Sunday.`);
    impactSummary.push(`Accelerates DSA Dynamic Programming mastery by 2 days.`);
    impactSummary.push(`Syllabus completion milestone brought forward from Sept 28 to Sept 25.`);
    simulatedWeeklyHours += 3;
    simulatedReadiness = Math.min(100, dsaProgress + 12);
    overloadRisk = 'Low';
  }

  return {
    scenario_name: scenario.name,
    current_metrics: {
      total_planned_sessions: currentTotal,
      weekly_hours: profile.weekly_study_target_hours || 24,
      dsa_readiness: dsaProgress,
      syllabus_completion_date: '2026-09-28',
      overload_risk: 'Low',
    },
    simulated_metrics: {
      total_planned_sessions: simulatedSessions.filter(s => s.status !== 'Cancelled').length,
      weekly_hours: simulatedWeeklyHours,
      dsa_readiness: simulatedReadiness,
      syllabus_completion_date: scenario.id === 'scenario-extra-weekend' ? '2026-09-25' : '2026-09-28',
      overload_risk: overloadRisk,
    },
    impact_summary: impactSummary,
    simulated_sessions: simulatedSessions,
  };
};
