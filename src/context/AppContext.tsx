import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StudentProfile, 
  Subject, 
  Topic, 
  Exam, 
  Goal, 
  AIInsight, 
  NotificationItem, 
  DailyProgress,
  StudySession,
  RescheduleProposal,
  NotificationSettings
} from '../types';
import { 
  INITIAL_PROFILE, 
  INITIAL_SUBJECTS, 
  INITIAL_TOPICS, 
  INITIAL_EXAMS, 
  INITIAL_GOALS, 
  INITIAL_AI_INSIGHTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_DAILY_PROGRESS,
  INITIAL_STUDY_SESSIONS
} from '../lib/initialData';
import { 
  findNextAvailableSlotForReschedule, 
  adjustScheduleForExamDateChange, 
  formatDateStr,
  generateAIStudyPlan
} from '../lib/plannerAlgorithm';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AppContextType {
  // Auth state
  user: AuthUser | null;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<StudentProfile>, initialSubjects?: Array<{ name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; examDate?: string; targetPercentage: number; color: string }>) => Promise<void>;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Subject>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubjectProgress: (subjectId: string) => number;

  // Topics (Syllabus)
  topics: Topic[];
  addTopic: (topic: Omit<Topic, 'id' | 'user_id' | 'created_at'>) => Promise<Topic>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  toggleTopicStatus: (id: string) => Promise<void>;

  // Exams
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'user_id' | 'created_at'>) => Promise<Exam>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoalCompleted: (id: string) => Promise<void>;

  // Study Sessions & Progress
  studySessions: StudySession[];
  dailyProgress: DailyProgress[];
  logStudySession: (subjectId: string, durationMinutes: number, notes?: string) => Promise<void>;
  addStudySession: (session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) => Promise<StudySession>;
  updateStudySession: (id: string, updates: Partial<StudySession>) => Promise<void>;
  deleteStudySession: (id: string) => Promise<void>;
  markSessionCompleted: (id: string, actualMinutes?: number) => Promise<void>;
  markSessionMissed: (id: string) => Promise<RescheduleProposal | null>;
  moveStudySession: (id: string, newDate: string, newStartTime?: string, newEndTime?: string) => Promise<{ success: boolean; conflict?: string }>;
  applyGeneratedPlan: (sessions: StudySession[]) => Promise<void>;
  applyExamDateChange: (examId: string, newDate: string) => Promise<void>;
  applyDailyHoursChange: (newHours: number) => Promise<void>;

  // Reschedule proposal banner / modal
  activeRescheduleProposal: RescheduleProposal | null;
  acceptRescheduleProposal: (proposalId: string) => Promise<void>;
  editRescheduleProposal: (proposalId: string, updates: Partial<StudySession>) => Promise<void>;
  discardRescheduleProposal: (proposalId: string) => Promise<void>;
  dismissRescheduleBanner: () => void;

  // Insights & Notifications
  aiInsights: AIInsight[];
  generateAIInsight: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'created_at'>) => void;

  // Theme & Appearance
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Notification Settings
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

  // Data management
  exportAllAcademicData: () => void;
  clearAllUserData: () => void;

  // Reset demo data helper
  resetToSampleData: () => void;
}

const STORAGE_KEYS = {
  USER: 'studyplan_user',
  PROFILE: 'studyplan_profile',
  SUBJECTS: 'studyplan_subjects',
  TOPICS: 'studyplan_topics',
  EXAMS: 'studyplan_exams',
  GOALS: 'studyplan_goals',
  INSIGHTS: 'studyplan_insights',
  NOTIFICATIONS: 'studyplan_notifications',
  PROGRESS: 'studyplan_progress',
  SESSIONS: 'studyplan_sessions',
  THEME: 'studyplan_theme',
  NOTIF_SETTINGS: 'studyplan_notif_settings',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default demo user logged in for instant evaluation
    return {
      id: INITIAL_PROFILE.user_id,
      email: INITIAL_PROFILE.email,
      fullName: INITIAL_PROFILE.full_name,
    };
  });

  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_PROFILE; }
    }
    return INITIAL_PROFILE;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_SUBJECTS; }
    }
    return INITIAL_SUBJECTS;
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_TOPICS; }
    }
    return INITIAL_TOPICS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_EXAMS; }
    }
    return INITIAL_EXAMS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_GOALS; }
    }
    return INITIAL_GOALS;
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_AI_INSIGHTS; }
    }
    return INITIAL_AI_INSIGHTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_NOTIFICATIONS; }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_DAILY_PROGRESS; }
    }
    return INITIAL_DAILY_PROGRESS;
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].start_time) {
          return parsed;
        }
      } catch (e) {
        // ignore and use fallback
      }
    }
    return INITIAL_STUDY_SESSIONS;
  });

  const [activeRescheduleProposal, setActiveRescheduleProposal] = useState<RescheduleProposal | null>(null);

  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'system') || 'light';
  });

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      exam_alerts: true,
      session_reminders: true,
      missed_session_alerts: true,
      risk_warnings: true,
      weekly_reports: true,
      streak_milestones: true,
    };
  });

  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(aiInsights));
  }, [aiInsights]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  // Check Supabase session on startup if enabled
  useEffect(() => {
    async function checkSupabaseSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'Student User',
            });
            // Fetch profile
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (dbProfile) {
              setProfile(dbProfile);
            }
          }
        } catch (err) {
          console.warn('Supabase session fetch error, continuing with local store:', err);
        }
      }
      setIsLoading(false);
    }
    checkSupabaseSession();
  }, []);

  // Calculate Subject Progress = completed topic duration / total topic duration * 100
  const getSubjectProgress = useCallback((subjectId: string): number => {
    const subjectTopics = topics.filter(t => t.subject_id === subjectId);
    if (subjectTopics.length === 0) {
      const subject = subjects.find(s => s.id === subjectId);
      return subject ? subject.current_knowledge_percentage : 0;
    }

    const totalDuration = subjectTopics.reduce((acc, t) => acc + (t.estimated_duration_hours || 1), 0);
    const completedDuration = subjectTopics
      .filter(t => t.status === 'Completed')
      .reduce((acc, t) => acc + (t.estimated_duration_hours || 1), 0);

    if (totalDuration === 0) return 0;
    return Math.round((completedDuration / totalDuration) * 100);
  }, [topics, subjects]);

  // Auth operations
  const login = async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'Student User',
          });
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local / Demo Login
    const demoUser: AuthUser = {
      id: 'user-' + Date.now(),
      email,
      fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Student User',
    };
    setUser(demoUser);

    if (!profile) {
      setProfile({
        ...INITIAL_PROFILE,
        user_id: demoUser.id,
        email: demoUser.email,
        full_name: demoUser.fullName,
      });
    }

    return { success: true };
  };

  const signup = async (email: string, password?: string, fullName?: string) => {
    const displayName = fullName || email.split('@')[0];

    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const newUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: displayName,
          };
          setUser(newUser);
          setProfile({
            ...INITIAL_PROFILE,
            id: 'profile-' + Date.now(),
            user_id: newUser.id,
            email: newUser.email,
            full_name: displayName,
            onboarding_completed: false,
          });
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Signup failed' };
      }
    }

    // Local signup
    const newUser: AuthUser = {
      id: 'user-' + Date.now(),
      email,
      fullName: displayName,
    };
    setUser(newUser);
    setProfile({
      ...INITIAL_PROFILE,
      id: 'profile-' + Date.now(),
      user_id: newUser.id,
      email: newUser.email,
      full_name: displayName,
      onboarding_completed: false, // will trigger onboarding
    });

    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase logout error', e);
      }
    }
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Password reset instructions sent to ${email}` };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to send reset link' };
      }
    }
    return { success: true, message: `Demo Mode: Password reset link has been dispatched to ${email}` };
  };

  const updateProfile = async (data: Partial<StudentProfile>) => {
    setProfile(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null);
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('profiles').update(data).eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase updateProfile error', err);
      }
    }
  };

  const completeOnboarding = async (
    data: Partial<StudentProfile>, 
    initialSubs?: Array<{ name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; examDate?: string; targetPercentage: number; color: string }>
  ) => {
    const updatedProfile: StudentProfile = {
      ...(profile || INITIAL_PROFILE),
      ...data,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    setProfile(updatedProfile);

    let currentSubjectsList = subjects;
    let currentTopicsList = topics;

    if (initialSubs && initialSubs.length > 0) {
      const newSubs: Subject[] = initialSubs.map((s, idx) => ({
        id: 'sub-new-' + (Date.now() + idx),
        user_id: user?.id || 'demo-user',
        name: s.name,
        current_knowledge_percentage: 20,
        target_percentage: s.targetPercentage || 85,
        difficulty: s.difficulty || 'Medium',
        exam_date: s.examDate,
        weekly_study_target_hours: 4,
        color: s.color || '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      currentSubjectsList = [...subjects, ...newSubs];
      setSubjects(currentSubjectsList);

      // Add default intro topic for each
      const newTopics: Topic[] = newSubs.map((sub, i) => ({
        id: 'top-init-' + (Date.now() + i),
        subject_id: sub.id,
        user_id: user?.id || 'demo-user',
        name: `${sub.name} Fundamentals & Core Concepts`,
        status: 'In Progress',
        difficulty: 'Easy',
        estimated_duration_hours: 3,
        order_index: 1,
        created_at: new Date().toISOString(),
      }));
      currentTopicsList = [...topics, ...newTopics];
      setTopics(currentTopicsList);
    }

    // Automatically generate initial study plan (Requirement 2)
    try {
      const initialPlan = generateAIStudyPlan(
        currentSubjectsList,
        currentTopicsList,
        exams,
        studySessions,
        updatedProfile,
        getSubjectProgress,
        { horizonDays: 7, includeRevision: true }
      );
      if (initialPlan && initialPlan.length > 0) {
        setStudySessions(prev => [...initialPlan, ...prev]);
        const notif: NotificationItem = {
          id: 'notif-' + Date.now(),
          user_id: user?.id || 'demo-user',
          title: 'Initial Study Plan Generated',
          message: `StudyPlan AI generated ${initialPlan.length} personalized study sessions for this week based on your onboarding preferences.`,
          type: 'ai',
          read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } catch (e) {
      console.warn('Auto study plan generation notice', e);
    }
  };

  // Subjects CRUD
  const addSubject = async (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newSubject: Subject = {
      ...data,
      id: 'sub-' + Date.now(),
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubjects(prev => [newSubject, ...prev]);

    // Create a notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: `Subject Added: ${data.name}`,
      message: `You started tracking ${data.name} with target ${data.target_percentage}%.`,
      type: 'system',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('subjects').insert({ ...newSubject, user_id: user.id });
      } catch (e) {
        console.warn('Supabase addSubject error', e);
      }
    }
    return newSubject;
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('subjects').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateSubject error', e);
      }
    }
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => prev.filter(t => t.subject_id !== id));
    setExams(prev => prev.filter(e => e.subject_id !== id));
    setGoals(prev => prev.filter(g => g.subject_id !== id));

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteSubject error', e);
      }
    }
  };

  // Topics CRUD
  const addTopic = async (data: Omit<Topic, 'id' | 'user_id' | 'created_at'>) => {
    const newTopic: Topic = {
      ...data,
      id: 'top-' + Date.now(),
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };
    setTopics(prev => [...prev, newTopic]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('topics').insert({ ...newTopic, user_id: user.id });
      } catch (e) {
        console.warn('Supabase addTopic error', e);
      }
    }
    return newTopic;
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('topics').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateTopic error', e);
      }
    }
  };

  const deleteTopic = async (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('topics').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTopic error', e);
      }
    }
  };

  const toggleTopicStatus = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    let nextStatus: Topic['status'] = 'In Progress';
    if (topic.status === 'Pending') nextStatus = 'In Progress';
    else if (topic.status === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'Pending';

    const updates: Partial<Topic> = {
      status: nextStatus,
      completed_at: nextStatus === 'Completed' ? new Date().toISOString() : undefined,
    };

    await updateTopic(id, updates);

    // If completed, add notification and increase today's completed topics
    if (nextStatus === 'Completed') {
      const subject = subjects.find(s => s.id === topic.subject_id);
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: `Topic Completed: ${topic.name}`,
        message: `Great job! You finished "${topic.name}" in ${subject?.name || 'Subject'}.`,
        type: 'goal',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Exams CRUD
  const addExam = async (data: Omit<Exam, 'id' | 'user_id' | 'created_at'>) => {
    const newExam: Exam = {
      ...data,
      id: 'exam-' + Date.now(),
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };
    setExams(prev => [...prev, newExam].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()));

    // Also update subject exam_date if not set
    const subject = subjects.find(s => s.id === data.subject_id);
    if (subject && !subject.exam_date) {
      updateSubject(subject.id, { exam_date: data.exam_date });
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('exams').insert({ ...newExam, user_id: user.id });
      } catch (e) {
        console.warn('Supabase addExam error', e);
      }
    }
    return newExam;
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('exams').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateExam error', e);
      }
    }
  };

  const deleteExam = async (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('exams').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteExam error', e);
      }
    }
  };

  // Goals CRUD
  const addGoal = async (data: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
    const newGoal: Goal = {
      ...data,
      id: 'goal-' + Date.now(),
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('goals').insert({ ...newGoal, user_id: user.id });
      } catch (e) {
        console.warn('Supabase addGoal error', e);
      }
    }
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('goals').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateGoal error', e);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('goals').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteGoal error', e);
      }
    }
  };

  const toggleGoalCompleted = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const isCompleted = !goal.is_completed;
    await updateGoal(id, {
      is_completed: isCompleted,
      current_progress_percentage: isCompleted ? 100 : Math.min(goal.current_progress_percentage, 95),
    });
  };

  // Log study session
  const logStudySession = async (subjectId: string, durationMinutes: number, notes?: string) => {
    const todayStr = formatDateStr(new Date());
    const session: StudySession = {
      id: 'sess-' + Date.now(),
      user_id: user?.id || 'demo-user',
      subject_id: subjectId,
      title: `${subjects.find(s => s.id === subjectId)?.name || 'Study'} Session`,
      session_date: todayStr,
      start_time: '18:00',
      end_time: '19:30',
      duration_minutes: durationMinutes,
      planned_duration_minutes: durationMinutes,
      actual_duration_minutes: durationMinutes,
      status: 'Completed',
      notes,
      efficiency_rating: 5,
      created_at: new Date().toISOString(),
    };

    setStudySessions(prev => [session, ...prev]);

    // Update today's daily progress
    setDailyProgress(prev => {
      const existing = prev.find(p => p.date === todayStr);
      if (existing) {
        return prev.map(p => p.date === todayStr ? {
          ...p,
          study_minutes: p.study_minutes + durationMinutes,
        } : p);
      } else {
        return [...prev, {
          id: 'dp-' + Date.now(),
          user_id: user?.id || 'demo-user',
          date: todayStr,
          study_minutes: durationMinutes,
          target_minutes: (profile?.daily_available_hours || 4) * 60,
          topics_completed: 1,
          efficiency_score: 90,
        }];
      }
    });

    const subject = subjects.find(s => s.id === subjectId);
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: `Study Session Logged`,
      message: `Logged ${durationMinutes} mins in ${subject?.name || 'Subject'}. Keep up the momentum!`,
      type: 'streak',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const addStudySession = async (sessionData: Omit<StudySession, 'id' | 'user_id' | 'created_at'>): Promise<StudySession> => {
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess-' + Date.now(),
      user_id: user?.id || 'demo-user',
      status: sessionData.status || 'Planned',
      duration_minutes: sessionData.duration_minutes || sessionData.planned_duration_minutes || 60,
      planned_duration_minutes: sessionData.planned_duration_minutes || sessionData.duration_minutes || 60,
      created_at: new Date().toISOString(),
    };

    setStudySessions(prev => [...prev, newSession]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_sessions').insert([{
          id: newSession.id,
          user_id: newSession.user_id,
          subject_id: newSession.subject_id,
          topic_id: newSession.topic_id || null,
          title: newSession.title,
          session_date: newSession.session_date,
          start_time: newSession.start_time,
          end_time: newSession.end_time,
          duration_minutes: newSession.duration_minutes,
          status: newSession.status,
          notes: newSession.notes || null,
          is_revision: newSession.is_revision || false,
        }]);
      } catch (err) {
        console.warn('Supabase session insert fallback to local', err);
      }
    }

    const sub = subjects.find(s => s.id === newSession.subject_id);
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Session Scheduled',
      message: `Added "${newSession.title}" on ${newSession.session_date} at ${newSession.start_time}.`,
      type: 'reminder',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    return newSession;
  };

  const updateStudySession = async (id: string, updates: Partial<StudySession>): Promise<void> => {
    setStudySessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_sessions').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase session update fallback to local', err);
      }
    }
  };

  const deleteStudySession = async (id: string): Promise<void> => {
    const session = studySessions.find(s => s.id === id);
    setStudySessions(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_sessions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase session delete fallback to local', err);
      }
    }
    if (session) {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: 'Session Removed',
        message: `Deleted scheduled session "${session.title}".`,
        type: 'reminder',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markSessionCompleted = async (id: string, actualMinutes?: number): Promise<void> => {
    const session = studySessions.find(s => s.id === id);
    if (!session) return;

    const duration = actualMinutes || session.actual_duration_minutes || session.planned_duration_minutes || session.duration_minutes || 60;

    // 1. Update session status
    await updateStudySession(id, {
      status: 'Completed',
      actual_duration_minutes: duration,
      duration_minutes: duration,
      efficiency_rating: 5,
    });

    // 2. If session had a linked topic, mark it completed
    if (session.topic_id) {
      await updateTopic(session.topic_id, {
        status: 'Completed',
        completed_at: new Date().toISOString(),
      });
    }

    // 3. Update daily progress for the session's date
    const dateStr = session.session_date;
    setDailyProgress(prev => {
      const existing = prev.find(p => p.date === dateStr);
      if (existing) {
        return prev.map(p => p.date === dateStr ? {
          ...p,
          study_minutes: p.study_minutes + duration,
          topics_completed: p.topics_completed + (session.topic_id ? 1 : 0),
        } : p);
      } else {
        return [...prev, {
          id: 'dp-' + Date.now(),
          user_id: user?.id || 'demo-user',
          date: dateStr,
          study_minutes: duration,
          target_minutes: (profile?.daily_available_hours || 4) * 60,
          topics_completed: session.topic_id ? 1 : 0,
          efficiency_score: 92,
        }];
      }
    });

    const sub = subjects.find(s => s.id === session.subject_id);
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Session Completed!',
      message: `Completed "${session.title}" (${duration} mins). Subject progress updated!`,
      type: 'streak',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markSessionMissed = async (id: string): Promise<RescheduleProposal | null> => {
    const session = studySessions.find(s => s.id === id);
    if (!session) return null;

    // Mark as missed
    await updateStudySession(id, { status: 'Missed' });

    // Look for next available slot
    if (!profile) return null;
    const suggested = findNextAvailableSlotForReschedule(
      session,
      studySessions,
      exams,
      subjects,
      profile
    );

    if (suggested) {
      const proposal: RescheduleProposal = {
        id: `prop-${Date.now()}`,
        original_session: session,
        suggested_session: suggested,
        reason: `Missed scheduled slot on ${session.session_date} at ${session.start_time || 'scheduled time'}`,
        created_at: new Date().toISOString(),
      };

      setActiveRescheduleProposal(proposal);

      const sub = subjects.find(s => s.id === session.subject_id);
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: 'Session Rescheduled',
        message: `Your missed ${sub?.name || 'study'} session has been automatically moved to ${suggested.session_date} at ${suggested.start_time}.`,
        type: 'ai',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);

      return proposal;
    } else {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: 'Session Missed',
        message: `Marked "${session.title}" as Missed. No open slots found before upcoming exam milestones.`,
        type: 'reminder',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
      return null;
    }
  };

  const acceptRescheduleProposal = async (proposalId: string): Promise<void> => {
    if (!activeRescheduleProposal || activeRescheduleProposal.id !== proposalId) return;

    const { original_session, suggested_session } = activeRescheduleProposal;

    // 1. Add suggested session as Planned
    const added = await addStudySession({
      subject_id: suggested_session.subject_id,
      topic_id: suggested_session.topic_id,
      title: suggested_session.title,
      session_date: suggested_session.session_date,
      start_time: suggested_session.start_time,
      end_time: suggested_session.end_time,
      duration_minutes: suggested_session.duration_minutes,
      planned_duration_minutes: suggested_session.planned_duration_minutes,
      status: 'Planned',
      is_revision: suggested_session.is_revision,
      rescheduled_from_session_id: original_session.id,
      notes: suggested_session.notes,
    });

    // 2. Link original session
    await updateStudySession(original_session.id, {
      rescheduled_to_session_id: added.id,
      status: 'Rescheduled',
    });

    setActiveRescheduleProposal(null);

    const sub = subjects.find(s => s.id === suggested_session.subject_id);
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Rescheduled Slot Confirmed',
      message: `Confirmed new study slot for ${sub?.name || 'Subject'} on ${suggested_session.session_date} at ${suggested_session.start_time}.`,
      type: 'ai',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const editRescheduleProposal = async (proposalId: string, updates: Partial<StudySession>): Promise<void> => {
    if (!activeRescheduleProposal || activeRescheduleProposal.id !== proposalId) return;
    setActiveRescheduleProposal({
      ...activeRescheduleProposal,
      suggested_session: {
        ...activeRescheduleProposal.suggested_session,
        ...updates,
      },
    });
  };

  const discardRescheduleProposal = async (proposalId: string): Promise<void> => {
    if (!activeRescheduleProposal || activeRescheduleProposal.id !== proposalId) return;
    const sub = subjects.find(s => s.id === activeRescheduleProposal.original_session.subject_id);
    setActiveRescheduleProposal(null);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Rescheduling Cancelled',
      message: `Discarded proposed reschedule for ${sub?.name || 'session'}. You can manually pick a slot in Calendar.`,
      type: 'reminder',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const dismissRescheduleBanner = () => {
    setActiveRescheduleProposal(null);
  };

  const moveStudySession = async (
    id: string, 
    newDate: string, 
    newStartTime?: string, 
    newEndTime?: string
  ): Promise<{ success: boolean; conflict?: string }> => {
    const session = studySessions.find(s => s.id === id);
    if (!session) return { success: false, conflict: 'Session not found' };

    // Rule 7: Never schedule a subject after its exam date!
    const subject = subjects.find(s => s.id === session.subject_id);
    const exam = exams.find(e => e.subject_id === session.subject_id);
    const examDateStr = exam?.exam_date || subject?.exam_date;

    if (examDateStr) {
      const examDate = new Date(examDateStr);
      const targetDate = new Date(newDate);
      if (targetDate > examDate) {
        const notif: NotificationItem = {
          id: 'notif-' + Date.now(),
          user_id: user?.id || 'demo-user',
          title: 'Schedule Conflict',
          message: `Cannot move "${session.title}" to ${newDate} because the exam takes place on ${examDateStr}!`,
          type: 'reminder',
          read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications(prev => [notif, ...prev]);
        return {
          success: false,
          conflict: `Cannot schedule session after the exam date (${examDateStr})!`,
        };
      }
    }

    const updates: Partial<StudySession> = {
      session_date: newDate,
    };
    if (newStartTime) updates.start_time = newStartTime;
    if (newEndTime) updates.end_time = newEndTime;

    await updateStudySession(id, updates);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Session Moved',
      message: `Moved "${session.title}" to ${newDate}${newStartTime ? ` at ${newStartTime}` : ''}.`,
      type: 'reminder',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true };
  };

  const applyGeneratedPlan = async (newSessions: StudySession[]): Promise<void> => {
    // Merge new sessions into state
    setStudySessions(prev => [...prev, ...newSessions]);

    if (isSupabaseConfigured && supabase) {
      try {
        const records = newSessions.map(s => ({
          id: s.id,
          user_id: s.user_id,
          subject_id: s.subject_id,
          topic_id: s.topic_id || null,
          title: s.title,
          session_date: s.session_date,
          start_time: s.start_time,
          end_time: s.end_time,
          duration_minutes: s.duration_minutes,
          status: s.status,
          notes: s.notes || null,
          is_revision: s.is_revision || false,
        }));
        await supabase.from('study_sessions').insert(records);
      } catch (err) {
        console.warn('Supabase batch insert fallback to local', err);
      }
    }

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Study Plan Applied',
      message: `Successfully scheduled ${newSessions.length} AI-optimized study and revision sessions across your calendar!`,
      type: 'ai',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const applyExamDateChange = async (examId: string, newDate: string): Promise<void> => {
    const exam = exams.find(e => e.id === examId);
    if (!exam || !profile) return;

    // 1. Update exam
    await updateExam(examId, { exam_date: newDate });

    // 2. Adjust schedule to prevent any sessions occurring after new exam date
    const { updatedSessions, movedCount } = adjustScheduleForExamDateChange(
      exam.subject_id,
      newDate,
      studySessions,
      profile
    );

    if (movedCount > 0) {
      setStudySessions(updatedSessions);
      const sub = subjects.find(s => s.id === exam.subject_id);
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: 'Schedule Automatically Rebalanced',
        message: `Exam date for ${sub?.name || 'Subject'} moved to ${newDate}. Automatically advanced ${movedCount} study sessions ahead of the exam!`,
        type: 'ai',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const applyDailyHoursChange = async (newHours: number): Promise<void> => {
    if (!profile) return;
    await updateProfile({
      daily_available_hours: newHours,
      weekly_study_target_hours: Math.round(newHours * 6),
    });

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'Study Capacity Updated',
      message: `Daily available study time adjusted to ${newHours} hours. Weekly target updated to ${Math.round(newHours * 6)} hours.`,
      type: 'ai',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Dynamic AI Insight Generator
  const generateAIInsight = () => {
    // Look for subjects with low progress and upcoming exams
    const sortedExams = [...exams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
    const urgentExam = sortedExams[0];
    const urgentSubject = urgentExam ? subjects.find(s => s.id === urgentExam.subject_id) : subjects[0];

    const newInsight: AIInsight = {
      id: 'ai-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: urgentExam ? `Accelerated Revision Plan for ${urgentExam.name}` : 'Cognitive Spacing Opportunity',
      summary: urgentExam 
        ? `You have ${urgentExam.name} coming up soon. Focus on pending high-weightage topics.` 
        : 'Your retention improves by 28% when reviewing topics 48 hours after initial completion.',
      recommendation: `Dedicate your upcoming study block (${profile?.preferred_study_start_time || '18:00'} - ${profile?.preferred_study_end_time || '22:00'}) to active recall and problem sets.`,
      subject_name: urgentSubject?.name,
      impact_level: 'High',
      action_label: 'Apply Recommended Schedule',
      created_at: new Date().toISOString(),
    };

    setAiInsights(prev => [newInsight, ...prev]);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: user?.id || 'demo-user',
      title: 'New AI Study Insight',
      message: newInsight.title,
      type: 'ai',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Notification helpers
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, is_read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, is_read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'created_at'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif-' + Date.now(),
      created_at: new Date().toISOString(),
      read: notifData.read || false,
      is_read: notifData.is_read || false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Data management
  const exportAllAcademicData = () => {
    const data = {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      student_profile: profile,
      subjects,
      topics,
      exams,
      goals,
      study_sessions: studySessions,
      daily_progress: dailyProgress,
      ai_insights: aiInsights,
      notifications,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyplan-ai-${profile?.full_name?.toLowerCase().replace(/\s+/g, '-') || 'student'}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllUserData = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
    setSubjects([]);
    setTopics([]);
    setExams([]);
    setGoals([]);
    setStudySessions([]);
    setDailyProgress([]);
    setAiInsights([]);
    setNotifications([]);
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setProfile(INITIAL_PROFILE);
    setSubjects(INITIAL_SUBJECTS);
    setTopics(INITIAL_TOPICS);
    setExams(INITIAL_EXAMS);
    setGoals(INITIAL_GOALS);
    setAiInsights(INITIAL_AI_INSIGHTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDailyProgress(INITIAL_DAILY_PROGRESS);
    setStudySessions(INITIAL_STUDY_SESSIONS);
    setActiveRescheduleProposal(null);
    setUser({
      id: INITIAL_PROFILE.user_id,
      email: INITIAL_PROFILE.email,
      fullName: INITIAL_PROFILE.full_name,
    });
  };

  const value = useMemo(() => ({
    user,
    profile,
    isAuthenticated: Boolean(user),
    isLoading,
    isSupabaseConnected: isSupabaseConfigured,
    login,
    signup,
    logout,
    forgotPassword,
    updateProfile,
    completeOnboarding,
    theme,
    setTheme,
    notificationSettings,
    updateNotificationSettings,
    exportAllAcademicData,
    clearAllUserData,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectProgress,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicStatus,
    exams,
    addExam,
    updateExam,
    deleteExam,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalCompleted,
    studySessions,
    dailyProgress,
    logStudySession,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    markSessionCompleted,
    markSessionMissed,
    moveStudySession,
    applyGeneratedPlan,
    applyExamDateChange,
    applyDailyHoursChange,
    activeRescheduleProposal,
    acceptRescheduleProposal,
    editRescheduleProposal,
    discardRescheduleProposal,
    dismissRescheduleBanner,
    aiInsights,
    generateAIInsight,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    addNotification,
    resetToSampleData,
  }), [
    user,
    profile,
    isLoading,
    subjects,
    topics,
    exams,
    goals,
    studySessions,
    dailyProgress,
    activeRescheduleProposal,
    aiInsights,
    notifications,
    getSubjectProgress,
    theme,
    notificationSettings,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
