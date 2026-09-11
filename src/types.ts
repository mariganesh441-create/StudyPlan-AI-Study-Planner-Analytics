export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type TopicStatus = 'Pending' | 'In Progress' | 'Completed';

export type StudyPeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  college: string;
  course: string;
  semester: string;
  daily_available_hours: number;
  preferred_study_start_time: string; // e.g. "18:00"
  preferred_study_end_time: string;   // e.g. "22:00"
  preferred_study_period: StudyPeriod;
  weekly_study_target_hours: number;
  current_streak_days: number;
  timezone?: string;
  target_gpa?: number;
  college_or_course?: string;
  semester_or_year?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
}

export interface NotificationSettings {
  exam_alerts: boolean;
  session_reminders: boolean;
  missed_session_alerts: boolean;
  risk_warnings: boolean;
  weekly_reports: boolean;
  streak_milestones: boolean;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  current_knowledge_percentage: number;
  target_percentage: number;
  difficulty: DifficultyLevel;
  exam_date?: string; // YYYY-MM-DD
  weekly_study_target_hours: number;
  color: string; // Hex color code e.g. #3B82F6
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  user_id: string;
  name: string;
  status: TopicStatus;
  difficulty: DifficultyLevel;
  estimated_duration_hours: number;
  order_index: number;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  exam_date: string; // ISO date
  exam_time?: string;
  location?: string;
  syllabus_coverage_percentage: number;
  target_score?: number;
  notes?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  target_metric: string; // e.g. "Complete 15 DSA topics" or "Score 85%+"
  current_progress_percentage: number;
  deadline: string; // YYYY-MM-DD
  is_completed: boolean;
  category: 'Subject Mastery' | 'Daily Habit' | 'Exam Prep' | 'Project';
  created_at: string;
}

export type SessionStatus = 'Planned' | 'Completed' | 'Missed' | 'Rescheduled' | 'Cancelled';

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id?: string;
  title: string;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM e.g. "18:00"
  end_time: string;   // HH:MM e.g. "19:30"
  duration_minutes: number; // planned duration in mins
  planned_duration_minutes?: number;
  actual_duration_minutes?: number;
  status: SessionStatus;
  is_revision?: boolean;
  rescheduled_from_session_id?: string;
  rescheduled_to_session_id?: string;
  notes?: string;
  efficiency_rating?: number; // 1-5
  created_at: string;
}

export interface SubjectPriority {
  subject_id: string;
  subject_name: string;
  color: string;
  difficulty: DifficultyLevel;
  current_progress: number;
  target_percentage: number;
  exam_date?: string;
  days_to_exam: number | null;
  remaining_syllabus_hours: number;
  weekly_target_hours: number;
  logged_hours_this_week: number;
  weekly_deficit_hours: number;
  priority_score: number; // 0 - 100+
  rank: number;
  score_factors: {
    exam_urgency_score: number;
    progress_gap_score: number;
    difficulty_multiplier: number;
    syllabus_load_score: number;
    weekly_deficit_score: number;
  };
}

export interface RescheduleProposal {
  id: string;
  original_session: StudySession;
  suggested_session: StudySession;
  reason: string;
  created_at: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  type: 'hours_change' | 'exam_shift' | 'miss_session' | 'extra_time';
  params: {
    date?: string;
    hours?: number;
    subject_id?: string;
    days_shift?: number;
    session_id?: string;
  };
}

export interface PlanSimulationResult {
  scenario_name: string;
  current_metrics: {
    total_planned_sessions: number;
    weekly_hours: number;
    dsa_readiness: number;
    syllabus_completion_date: string;
    overload_risk: 'Low' | 'Moderate' | 'High';
  };
  simulated_metrics: {
    total_planned_sessions: number;
    weekly_hours: number;
    dsa_readiness: number;
    syllabus_completion_date: string;
    overload_risk: 'Low' | 'Moderate' | 'High';
  };
  impact_summary: string[];
  simulated_sessions: StudySession[];
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  study_minutes: number;
  target_minutes: number;
  topics_completed: number;
  efficiency_score: number; // 0-100
}

export type NotificationType = 
  | 'exam' 
  | 'goal' 
  | 'streak' 
  | 'system' 
  | 'ai' 
  | 'reminder' 
  | 'session' 
  | 'task' 
  | 'deadline' 
  | 'report' 
  | 'risk';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read?: boolean;
  is_read?: boolean;
  created_at: string;
}

export interface SubjectPerformanceAnalysis {
  subject_id: string;
  subject_name: string;
  color: string;
  difficulty: DifficultyLevel;
  current_progress: number;
  target_percentage: number;
  remaining_percentage: number;
  exam_date?: string;
  days_to_exam: number | null;
  topics_completed: number;
  topics_remaining: number;
  study_hours: number;
  weekly_improvement: number;
  priority_rank: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_reason: string;
  recommendation: string;
}

export interface WeeklyReportData {
  week_range: string;
  planned_hours: number;
  actual_hours: number;
  achievement_percentage: number;
  tasks_planned: number;
  tasks_completed: number;
  tasks_missed: number;
  rescheduled_sessions: number;
  study_streak: number;
  consistency_score: number;
  subject_progress: Array<{
    subject_name: string;
    progress: number;
    weekly_delta: number;
    color: string;
  }>;
  previous_week_achievement: number;
  improvement_percentage: number;
  ai_insights: string[];
}

export interface MonthlyReportData {
  month_name: string;
  total_study_hours: number;
  average_daily_hours: number;
  completed_topics: number;
  completed_tasks: number;
  missed_sessions: number;
  rescheduled_sessions: number;
  strongest_subject: string;
  weakest_subject: string;
  consistency_score: number;
  monthly_hours_previous: number;
  monthly_improvement_percentage: number;
}

export interface AIInsight {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  recommendation: string;
  subject_name?: string;
  impact_level: 'High' | 'Medium' | 'Low';
  action_label?: string;
  created_at: string;
}

export interface UserValidationEntry {
  id: string;
  tester_number: string; // e.g. "Tester #1"
  tester_profile: string; // e.g. "B.Tech Computer Science (Semester 5)"
  tested_module: string; // e.g. "AI Study Planner & Daily Tasks"
  feedback: string;
  issue_identified: string;
  improvement_made: string;
  final_response: string;
  date_logged: string;
}

