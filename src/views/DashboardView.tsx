import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  ChevronRight, 
  AlertCircle,
  Play,
  Award,
  ListTree
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSession: () => void;
  onOpenAddSubject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenQuickSession,
  onOpenAddSubject,
}) => {
  const { 
    profile, 
    subjects, 
    topics, 
    exams, 
    goals, 
    dailyProgress, 
    studySessions,
    markSessionCompleted,
    aiInsights, 
    generateAIInsight,
    getSubjectProgress,
    toggleTopicStatus
  } = useApp();

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySessions = studySessions.filter(s => s.session_date === todayDateStr && s.status !== 'Cancelled');

  // Calculations
  const totalSubjects = subjects.length;
  const overallProgress = totalSubjects > 0 
    ? Math.round(subjects.reduce((acc, s) => acc + getSubjectProgress(s.id), 0) / totalSubjects)
    : 0;

  // Today's progress calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = dailyProgress.find(p => p.date === todayStr);
  const todayMinutes = todayRecord ? todayRecord.study_minutes : 150;
  const targetMinutes = (profile?.daily_available_hours || 4) * 60;
  const todayPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  // Weekly study hours calculation (sum of last 7 daily progress days)
  const weeklyStudyMinutes = dailyProgress.slice(-7).reduce((acc, p) => acc + p.study_minutes, 0);
  const weeklyStudyHours = Math.round((weeklyStudyMinutes / 60) * 10) / 10;
  const weeklyTarget = profile?.weekly_study_target_hours || 24;
  const weeklyPercent = Math.min(100, Math.round((weeklyStudyHours / weeklyTarget) * 100));

  // Upcoming Exams sorted by days left
  const calculateDaysLeft = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

  // In Progress Topics (Pending tasks)
  const pendingTasks = topics.filter(t => t.status !== 'Completed').slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A1538] via-[#121B36] to-[#0E1A30] p-6 sm:p-8 text-white border border-[#7C3AED]/40 shadow-xl shadow-[#7C3AED]/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 backdrop-blur-md text-xs font-semibold mb-3 text-[#2DD4BF]">
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>AI Study Optimizer Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white glow-title">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Alex'}! 👋
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your next milestone is <span className="font-bold text-white underline decoration-[#F472B6] decoration-2">DSA Exam in 5 days</span>. 
            You've logged <span className="text-[#2DD4BF] font-semibold">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</span> of focused study today.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenQuickSession}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Log Study Block</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-planner')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Review AI Study Plan</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-end pr-8">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* TOP STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall Progress */}
        <div className="bg-[#111728] rounded-2xl p-5 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Progress</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white glow-stat-purple">{overallProgress}%</span>
              <span className="text-xs text-[#2DD4BF] font-semibold">+4.2% this week</span>
            </div>
            <div className="h-2 w-full bg-[#18223C] rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-full transition-all duration-500" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{totalSubjects} enrolled subjects calculated</p>
        </div>

        {/* 2. Today's Progress */}
        <div className="bg-[#111728] rounded-2xl p-5 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Progress</span>
            <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white glow-stat-teal">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</span>
              <span className="text-xs text-slate-400 font-medium">/ {profile?.daily_available_hours || 4}h goal</span>
            </div>
            <div className="h-2 w-full bg-[#18223C] rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF] rounded-full transition-all duration-500" 
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{todayPercent}% of daily study capacity completed</p>
        </div>

        {/* 3. Weekly Study Hours */}
        <div className="bg-[#111728] rounded-2xl p-5 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Study Hours</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white glow-stat-purple">{weeklyStudyHours}h</span>
              <span className="text-xs text-slate-400 font-medium">/ {weeklyTarget}h target</span>
            </div>
            <div className="h-2 w-full bg-[#18223C] rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-full transition-all duration-500" 
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{weeklyPercent}% reached for this week's quota</p>
        </div>

        {/* 4. Current Streak */}
        <div className="bg-[#111728] rounded-2xl p-5 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
            <div className="w-8 h-8 rounded-xl bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-[#F472B6] text-[#F472B6]" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#F472B6] glow-stat-pink">{profile?.current_streak_days || 12} Days</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div 
                  key={d} 
                  className={`h-2 flex-1 rounded-full ${d <= 6 ? 'bg-[#F472B6]' : 'bg-slate-800'}`} 
                  title={`Day ${d}`}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Next Milestone: 14 Days (Scholar Badge)</p>
        </div>
      </div>

      {/* MIDDLE SECTION: UPCOMING EXAMS & AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Upcoming Exams & Subject Progress */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Exams Card */}
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Upcoming Exams</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] font-semibold border border-[#7C3AED]/40">
                  {exams.length} Scheduled
                </span>
              </div>
              <button
                onClick={() => setActiveTab('exams')}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#9F67FF] flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {sortedExams.slice(0, 3).map((exam) => {
                const daysLeft = calculateDaysLeft(exam.exam_date);
                const isUrgent = daysLeft <= 7;
                const subject = subjects.find(s => s.id === exam.subject_id);

                return (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUrgent 
                        ? 'border-[#F472B6]/40 bg-[#F472B6]/10' 
                        : 'border-slate-800/80 bg-[#141C32]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-10 rounded-full shrink-0" 
                        style={{ backgroundColor: subject?.color || '#7C3AED' }} 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{exam.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-[#1A233C] border border-slate-700/60 text-slate-300">
                            {subject?.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {exam.exam_time || 'Morning'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-medium block">Coverage</span>
                        <span className="text-xs font-bold text-slate-200">{exam.syllabus_coverage_percentage}%</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs ${
                        isUrgent ? 'bg-[#F472B6] text-slate-950 glow-badge-pink' : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                      }`}>
                        <span>{daysLeft === 0 ? 'Today!' : daysLeft < 0 ? 'Passed' : `${daysLeft} Days Left`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Progress Cards */}
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Subject Progress</h3>
                <p className="text-xs text-slate-400">Calculated from completed topic hours vs syllabus totals</p>
              </div>
              <button
                onClick={() => setActiveTab('subjects')}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#9F67FF] flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Subjects</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((sub) => {
                const progress = getSubjectProgress(sub.id);
                return (
                  <div 
                    key={sub.id} 
                    onClick={() => setActiveTab('syllabus')}
                    className="p-3.5 rounded-xl border border-slate-800/80 hover:border-[#7C3AED]/50 bg-[#141C32] hover:bg-[#18233F] cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="text-sm font-bold text-slate-200">{sub.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          sub.difficulty === 'Hard' ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/30' :
                          sub.difficulty === 'Medium' ? 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30' : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                        }`}>
                          {sub.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Target: {sub.target_percentage}%</span>
                        <span className="text-sm font-black text-white">{progress}%</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-[#1A233C] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: AI Insights & Today's Schedule & Pending Tasks */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Insights Card */}
          <div className="bg-[#121B34] rounded-2xl p-5 text-white shadow-md border border-[#7C3AED]/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white glow-title">Live AI Study Insights</h3>
                  <span className="text-[10px] text-slate-400">Real-time academic telemetry</span>
                </div>
              </div>
              <button
                onClick={generateAIInsight}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Generate fresh AI insight based on exam proximity"
              >
                <span>Regenerate</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="p-3 rounded-xl bg-[#162140] border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F472B6]">
                    DSA Mid-Term in 5 Days: Acceleration Needed
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40 font-bold">
                    High Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  DSA is at 45% completion with 4 hard topics pending. Increase daily study time by 30 minutes to reach your 90% target score.
                </p>
              </div>

              {/* Insight 2 */}
              <div className="p-3 rounded-xl bg-[#162140] border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#2DD4BF]">
                    DBMS Syllabus Projected Ahead of Schedule
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 font-semibold">
                    On Track
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  At your current study pace, you will finish all DBMS relational topics 4 days prior to the examination paper.
                </p>
              </div>

              {/* Insight 3 */}
              <div className="p-3 rounded-xl bg-[#162140] border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#A78BFA]">
                    Peak Cognitive Focus Window: 6:00 PM – 9:00 PM
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/40 font-semibold">
                    Consistency
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your logged sessions show 94% retention efficiency in your preferred evening window. Study consistency improved to 84% this week.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setActiveTab('analytics')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-bold transition-colors text-center cursor-pointer"
              >
                View Analytics
              </button>
              <button
                onClick={() => setActiveTab('ai-planner')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer glow-badge-purple"
              >
                <span>Study Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Schedule Placeholder / Active Focus Window */}
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Today's Focus Schedule</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30">
                  {profile?.preferred_study_period || 'Evening'} Slot
                </span>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#9F67FF] cursor-pointer"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {todaySessions.length > 0 ? (
                todaySessions.slice(0, 2).map(session => {
                  const sub = subjects.find(s => s.id === session.subject_id);
                  const isDone = session.status === 'Completed';
                  return (
                    <div 
                      key={session.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isDone ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]/30' : 'bg-[#141C32] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || '#7C3AED' }}
                        />
                        <div>
                          <span className={`font-bold block ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {session.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {session.start_time}–{session.end_time} • {session.duration_minutes}m
                          </span>
                        </div>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => markSessionCompleted(session.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-[#2DD4BF] hover:bg-[#14B8A6] rounded-lg transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3.5 rounded-xl bg-[#141C32] border border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center justify-between mb-1">
                    <span>Optimal Retention Window</span>
                    <span className="font-bold text-[#2DD4BF]">
                      {profile?.preferred_study_start_time || '18:00'} – {profile?.preferred_study_end_time || '22:00'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-1">
                    Focus: <span className="text-[#7C3AED] font-bold">Generate AI Plan</span> to assign daily slots.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('tasks')}
                className="py-2.5 px-3 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#7C3AED] border border-[#7C3AED]/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Daily Checklist</span>
              </button>

              <button
                onClick={onOpenQuickSession}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Quick Log</span>
              </button>
            </div>
          </div>

          {/* Pending Tasks / Topics in Progress */}
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-base">Pending Tasks</h3>
              <button
                onClick={() => setActiveTab('syllabus')}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#9F67FF] cursor-pointer"
              >
                Syllabus &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map((t) => {
                const sub = subjects.find(s => s.id === t.subject_id);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-[#141C32] flex items-center justify-between gap-2 text-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleTopicStatus(t.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          t.status === 'In Progress' 
                            ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#7C3AED]' 
                            : 'border-slate-600 hover:border-slate-400'
                        }`}
                        title="Click to cycle status"
                      >
                        {t.status === 'In Progress' && <div className="w-2 h-2 rounded-xs bg-[#7C3AED]" />}
                      </button>
                      <div className="truncate">
                        <span className="font-semibold text-slate-200 block truncate">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{sub?.name} • {t.estimated_duration_hours}h</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      t.status === 'In Progress' ? 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
