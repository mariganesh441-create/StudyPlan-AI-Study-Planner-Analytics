-- =========================================================================
-- StudyPlan AI – PostgreSQL Database Schema for Supabase
-- Tables: profiles, subjects, topics, exams, goals, study_sessions,
--         daily_progress, notifications, ai_insights
-- Features: Row Level Security (RLS), User-specific policies, Timestamps, Triggers
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT,
    course TEXT,
    semester TEXT,
    daily_available_hours NUMERIC(4, 2) DEFAULT 3.0,
    preferred_study_start_time TIME DEFAULT '18:00',
    preferred_study_end_time TIME DEFAULT '22:00',
    preferred_study_period TEXT DEFAULT 'Evening' CHECK (preferred_study_period IN ('Morning', 'Afternoon', 'Evening', 'Night')),
    weekly_study_target_hours NUMERIC(4, 2) DEFAULT 20.0,
    current_streak_days INT DEFAULT 0,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_knowledge_percentage INT DEFAULT 0 CHECK (current_knowledge_percentage >= 0 AND current_knowledge_percentage <= 100),
    target_percentage INT DEFAULT 90 CHECK (target_percentage >= 0 AND target_percentage <= 100),
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    exam_date DATE,
    weekly_study_target_hours NUMERIC(4, 2) DEFAULT 4.0,
    color TEXT DEFAULT '#3B82F6',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TOPICS (SYLLABUS) TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    estimated_duration_hours NUMERIC(4, 2) DEFAULT 1.5,
    order_index INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME,
    location TEXT,
    syllabus_coverage_percentage INT DEFAULT 100 CHECK (syllabus_coverage_percentage >= 0 AND syllabus_coverage_percentage <= 100),
    target_score INT DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_metric TEXT NOT NULL,
    current_progress_percentage INT DEFAULT 0 CHECK (current_progress_percentage >= 0 AND current_progress_percentage <= 100),
    deadline DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'Subject Mastery' CHECK (category IN ('Subject Mastery', 'Daily Habit', 'Exam Prep', 'Project')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    efficiency_rating INT DEFAULT 4 CHECK (efficiency_rating >= 1 AND efficiency_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. DAILY PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    study_minutes INT DEFAULT 0,
    target_minutes INT DEFAULT 180,
    topics_completed INT DEFAULT 0,
    efficiency_score INT DEFAULT 85,
    CONSTRAINT unique_user_daily_progress UNIQUE (user_id, date)
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('exam', 'goal', 'streak', 'system', 'ai')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. AI INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    subject_name TEXT,
    impact_level TEXT DEFAULT 'Medium' CHECK (impact_level IN ('High', 'Medium', 'Low')),
    action_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- SUBJECTS POLICIES
CREATE POLICY "Users can view their own subjects"
    ON public.subjects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects"
    ON public.subjects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
    ON public.subjects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
    ON public.subjects FOR DELETE
    USING (auth.uid() = user_id);

-- TOPICS POLICIES
CREATE POLICY "Users can view their own topics"
    ON public.topics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topics"
    ON public.topics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics"
    ON public.topics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics"
    ON public.topics FOR DELETE
    USING (auth.uid() = user_id);

-- EXAMS POLICIES
CREATE POLICY "Users can view their own exams"
    ON public.exams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams"
    ON public.exams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
    ON public.exams FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
    ON public.exams FOR DELETE
    USING (auth.uid() = user_id);

-- GOALS POLICIES
CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- STUDY SESSIONS POLICIES
CREATE POLICY "Users can view their own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- DAILY PROGRESS POLICIES
CREATE POLICY "Users can view their own daily progress"
    ON public.daily_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own daily progress"
    ON public.daily_progress FOR ALL
    USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- AI INSIGHTS POLICIES
CREATE POLICY "Users can view their own ai insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

-- =========================================================================
-- AUTOMATED USER CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically create a profile record
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, college, course, semester)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
    COALESCE(new.raw_user_meta_data->>'college', ''),
    COALESCE(new.raw_user_meta_data->>'course', ''),
    COALESCE(new.raw_user_meta_data->>'semester', 'Semester 1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
