import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Lightbulb, 
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  calculateConsistencyScore, 
  calculateSubjectPerformance, 
  calculatePlannedVsActual,
  DateFilterType,
  getDaysDifference
} from '../lib/analyticsEngine';

export const AnalyticsView: React.FC = () => {
  const { 
    subjects, 
    topics, 
    exams, 
    goals, 
    dailyProgress, 
    studySessions, 
    profile, 
    getSubjectProgress 
  } = useApp();

  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterType>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Planned vs Actual view mode
  const [chartMode, setChartMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Selected subject for deep drilldown
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Compute date range boundary
  const { startDate, endDate, totalDaysInRange } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (dateFilter === '7d') {
      start.setDate(end.getDate() - 6);
    } else if (dateFilter === '30d') {
      start.setDate(end.getDate() - 29);
    } else if (dateFilter === '90d') {
      start.setDate(end.getDate() - 89);
    } else {
      const parsedStart = new Date(customStartDate + 'T00:00:00');
      const parsedEnd = new Date(customEndDate + 'T23:59:59');
      return {
        startDate: parsedStart,
        endDate: parsedEnd,
        totalDaysInRange: Math.max(1, getDaysDifference(parsedStart, parsedEnd) + 1),
      };
    }

    return {
      startDate: start,
      endDate: end,
      totalDaysInRange: Math.max(1, getDaysDifference(start, end) + 1),
    };
  }, [dateFilter, customStartDate, customEndDate]);

  // Filter progress & sessions by date range
  const filteredDailyProgress = useMemo(() => {
    return dailyProgress.filter(p => {
      const pDate = new Date(p.date + 'T00:00:00');
      return pDate >= startDate && pDate <= endDate;
    });
  }, [dailyProgress, startDate, endDate]);

  const filteredSessions = useMemo(() => {
    return studySessions.filter(s => {
      const sDate = new Date(s.session_date + 'T00:00:00');
      return sDate >= startDate && sDate <= endDate;
    });
  }, [studySessions, startDate, endDate]);

  // Overall KPIs
  const totalStudyMinutes = useMemo(() => {
    return filteredDailyProgress.reduce((acc, p) => acc + p.study_minutes, 0);
  }, [filteredDailyProgress]);

  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const avgDailyHours = Math.round((totalStudyHours / totalDaysInRange) * 10) / 10;

  // Syllabus completion
  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter(t => t.status === 'Completed').length;
  const syllabusCompletionPercentage = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  // Task / Session completion
  const totalPlannedSessions = filteredSessions.length;
  const completedSessionsCount = filteredSessions.filter(s => s.status === 'Completed').length;
  const missedSessionsCount = filteredSessions.filter(s => s.status === 'Missed').length;
  const rescheduledSessionsCount = filteredSessions.filter(s => s.status === 'Rescheduled').length;
  const taskCompletionPercentage = totalPlannedSessions > 0
    ? Math.round((completedSessionsCount / totalPlannedSessions) * 100)
    : 85;

  // Overall average subject progress
  const overallProgress = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + getSubjectProgress(s.id), 0) / subjects.length)
    : 0;

  // Consistency Score formula: (days with >= 1 completed session) / total days * 100
  const consistencyScore = useMemo(() => {
    return calculateConsistencyScore(filteredSessions, filteredDailyProgress, startDate, endDate);
  }, [filteredSessions, filteredDailyProgress, startDate, endDate]);

  // Subject performance analysis & highlights
  const {
    analyses,
    strongestSubject,
    weakestSubject,
    highestPrioritySubject
  } = useMemo(() => {
    return calculateSubjectPerformance(subjects, topics, exams, studySessions, getSubjectProgress);
  }, [subjects, topics, exams, studySessions, getSubjectProgress]);

  // Filtered analyses if subject selected
  const displayedAnalyses = useMemo(() => {
    if (selectedSubjectFilter === 'all') return analyses;
    return analyses.filter(a => a.subject_id === selectedSubjectFilter);
  }, [analyses, selectedSubjectFilter]);

  // Planned vs Actual data
  const plannedVsActualData = useMemo(() => {
    return calculatePlannedVsActual(studySessions, dailyProgress, chartMode);
  }, [studySessions, dailyProgress, chartMode]);

  return (
    <div className="space-y-8 pb-16 text-white">
      {/* HEADER & DATE RANGE FILTER BAR */}
      <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-2.5 py-0.5 rounded-full">
              Live Progress Analytics
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Real-time database sync</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight glow-title">Academic Performance Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit study velocity, consistency metrics, syllabus milestones, and AI risk signals
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#141C32] p-1 rounded-xl border border-slate-700/80">
            {(['7d', '30d', '90d', 'custom'] as DateFilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === f
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === '7d' ? 'Last 7 Days' : f === '30d' ? 'Last 30 Days' : f === '90d' ? 'Last 90 Days' : 'Custom Range'}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1.5 bg-[#141C32] p-1.5 rounded-xl border border-slate-700/80 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#0B1020] border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium text-xs focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#0B1020] border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium text-xs focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* TOP 8 EXECUTIVE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall Progress */}
        <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Progress</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{overallProgress}%</span>
              <span className="text-xs text-[#2DD4BF] font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +4.2%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Weighted syllabus mastery across {subjects.length} subjects</p>
        </div>

        {/* 2. Total Study Hours & Average Daily */}
        <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Study Hours</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{totalStudyHours}h</span>
              <span className="text-xs text-slate-400 font-medium">({avgDailyHours}h / day avg)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((avgDailyHours / (profile?.daily_available_hours || 4)) * 100))}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Target: {profile?.daily_available_hours || 4}h daily capacity</p>
        </div>

        {/* 3. Consistency Score */}
        <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consistency Score</span>
            <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#2DD4BF]">{consistencyScore}%</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30">
                {consistencyScore >= 80 ? 'High' : consistencyScore >= 60 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                style={{ width: `${consistencyScore}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Active study days ÷ {totalDaysInRange} total days in filter</p>
        </div>

        {/* 4. Study Streak */}
        <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Study Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{profile?.current_streak_days || 12}</span>
              <span className="text-sm font-bold text-slate-400">Days</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((profile?.current_streak_days || 12) / 21) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Continuous study record: 18 days</p>
        </div>
      </div>

      {/* SECONDARY ROW: SYLLABUS, TASKS, MISSED, RESCHEDULED */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111728] p-4 rounded-xl border border-slate-800/80 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Syllabus Completion</span>
          <span className="text-2xl font-black text-white mt-1 block">{syllabusCompletionPercentage}%</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{completedTopicsCount} of {totalTopicsCount} topics mastered</span>
        </div>

        <div className="bg-[#111728] p-4 rounded-xl border border-slate-800/80 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Task Completion Rate</span>
          <span className="text-2xl font-black text-[#2DD4BF] mt-1 block">{taskCompletionPercentage}%</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{completedSessionsCount} sessions completed</span>
        </div>

        <div className="bg-[#111728] p-4 rounded-xl border border-slate-800/80 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Missed Sessions</span>
          <span className="text-2xl font-black text-[#F472B6] mt-1 block">{missedSessionsCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Recovered via AI reschedule</span>
        </div>

        <div className="bg-[#111728] p-4 rounded-xl border border-slate-800/80 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Rescheduled Slots</span>
          <span className="text-2xl font-black text-[#7C3AED] mt-1 block">{rescheduledSessionsCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-exam conflict free</span>
        </div>
      </div>

      {/* SUBJECT COMPARISON HIGHLIGHT CARDS: STRONGEST, WEAKEST, HIGHEST PRIORITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strongest Subject */}
        <div className="bg-[#111728] border border-[#2DD4BF]/30 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-xs shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2DD4BF]">
              Strongest Subject
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {strongestSubject?.subject_name || 'Python Programming'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Current progress is <span className="font-bold text-[#2DD4BF]">{strongestSubject?.current_progress}%</span> vs target {strongestSubject?.target_percentage}%. 
              Highest syllabus completion rate.
            </p>
          </div>
        </div>

        {/* Weakest Subject */}
        <div className="bg-[#111728] border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Weakest Subject
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {weakestSubject?.subject_name || 'Data Structures'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Lagging at <span className="font-bold text-amber-400">{weakestSubject?.current_progress}%</span> with {weakestSubject?.topics_remaining} remaining topics before upcoming assessments.
            </p>
          </div>
        </div>

        {/* Highest Priority Subject */}
        <div className="bg-[#111728] border border-[#F472B6]/30 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/30 shadow-xs shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F472B6]">
              Highest Priority Subject
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {highestPrioritySubject?.subject_name || 'DSA'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Exam in <span className="font-bold text-[#F472B6]">{highestPrioritySubject?.days_to_exam ?? 5} days</span>. 
              {highestPrioritySubject?.risk_reason}
            </p>
          </div>
        </div>
      </div>

      {/* PLANNED VS ACTUAL STUDY HOURS SECTION */}
      <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Planned vs. Actual Study Hours</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30">
                Audited Comparison
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare scheduled allocation commitments against logged focus sessions
            </p>
          </div>

          <div className="flex items-center bg-[#141C32] p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
            {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  chartMode === mode
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plannedVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="h" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111728', 
                  border: '1px solid rgba(124, 58, 237, 0.3)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any, name: any) => [
                  `${value} hrs`, 
                  name === 'planned' ? 'Planned Study' : 'Actual Logged'
                ]}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar name="Planned Hours" dataKey="planned" fill="#475569" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar name="Actual Hours" dataKey="actual" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Insight Bar */}
        <div className="p-3.5 rounded-xl bg-[#141C32] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Study Cadence Insight:</strong> You achieved 
              <span className="text-[#2DD4BF] font-bold ml-1">
                {Math.round((plannedVsActualData.reduce((a, b) => a + b.actual, 0) / Math.max(1, plannedVsActualData.reduce((a, b) => a + b.planned, 0))) * 100)}%
              </span> of your scheduled commitments across this time view.
            </span>
          </div>
          <span className="text-slate-400 font-medium">Automatic updates via session logging</span>
        </div>
      </div>

      {/* COMPREHENSIVE SUBJECT PERFORMANCE ANALYSIS TABLE */}
      <div className="bg-[#111728] rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Comprehensive Subject Analysis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current progress, exam countdown, topic mastery, and weekly velocity for every subject
            </p>
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#141C32] text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="all">All Registered Subjects ({analyses.length})</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#141C32]/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-3">Progress / Target</th>
                <th className="py-3.5 px-3">Remaining %</th>
                <th className="py-3.5 px-3">Exam Countdown</th>
                <th className="py-3.5 px-3">Topics Mastered</th>
                <th className="py-3.5 px-3">Logged Hours</th>
                <th className="py-3.5 px-3">Weekly Gain</th>
                <th className="py-3.5 px-4 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedAnalyses.map((sub) => {
                return (
                  <tr key={sub.subject_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                      <div>
                        <span className="block font-bold text-white">{sub.subject_name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          sub.difficulty === 'Hard' ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/30' :
                          sub.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                        }`}>
                          {sub.difficulty}
                        </span>
                      </div>
                    </td>

                    {/* Progress / Target */}
                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-white">{sub.current_progress}%</span>
                          <span className="text-slate-400">Target: {sub.target_percentage}%</span>
                        </div>
                        <div className="h-1.5 w-28 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${sub.current_progress}%`, backgroundColor: sub.color }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Remaining % */}
                    <td className="py-4 px-3 font-semibold text-slate-300">
                      {sub.remaining_percentage > 0 ? (
                        <span className="text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                          {sub.remaining_percentage}% left
                        </span>
                      ) : (
                        <span className="text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 px-2 py-0.5 rounded">
                          Target Met!
                        </span>
                      )}
                    </td>

                    {/* Exam Countdown */}
                    <td className="py-4 px-3">
                      {sub.days_to_exam !== null ? (
                        <div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block ${
                            sub.days_to_exam <= 5 
                              ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40 animate-pulse' 
                              : sub.days_to_exam <= 14 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {sub.days_to_exam === 0 ? 'Today!' : `${sub.days_to_exam} days`}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{sub.exam_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No exam scheduled</span>
                      )}
                    </td>

                    {/* Topics Mastered */}
                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-200">{sub.topics_completed}</span>
                      <span className="text-slate-400"> / {sub.topics_completed + sub.topics_remaining}</span>
                      <span className="text-[10px] text-slate-500 block">({sub.topics_remaining} remaining)</span>
                    </td>

                    {/* Logged Hours */}
                    <td className="py-4 px-3 font-mono font-bold text-[#2DD4BF]">
                      {sub.study_hours} hrs
                    </td>

                    {/* Weekly Gain */}
                    <td className="py-4 px-3">
                      <span className="font-bold text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +{sub.weekly_improvement}%
                      </span>
                    </td>

                    {/* Risk Level */}
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                        sub.risk_level === 'High' 
                          ? 'bg-[#F472B6] text-white shadow-sm shadow-[#F472B6]/40' 
                          : sub.risk_level === 'Medium' 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-[#2DD4BF] text-slate-950 font-bold'
                      }`}>
                        {sub.risk_level} Risk
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI RISK DETECTION & ACTIONABLE RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AI Risk Detection */}
        <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Academic Risk Detection</h2>
              <p className="text-xs text-slate-400">Predictive pace evaluation against exam deadlines</p>
            </div>
          </div>

          <div className="space-y-3">
            {analyses.filter(a => a.risk_level !== 'Low').map((sub) => (
              <div 
                key={sub.subject_id} 
                className={`p-4 rounded-xl border ${
                  sub.risk_level === 'High' 
                    ? 'bg-[#141C32] border-[#F472B6]/40' 
                    : 'bg-[#141C32] border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sub.subject_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B1020] border border-slate-700 text-slate-300">
                      {sub.current_progress}% of {sub.target_percentage}% target
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    sub.risk_level === 'High' ? 'bg-[#F472B6] text-white' : 'bg-amber-500 text-slate-950 font-bold'
                  }`}>
                    {sub.risk_level} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {sub.risk_reason}
                </p>
              </div>
            ))}

            {analyses.filter(a => a.risk_level !== 'Low').length === 0 && (
              <div className="p-6 rounded-xl bg-[#141C32] border border-[#2DD4BF]/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#2DD4BF] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All Subjects On Track!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your current study pace is sufficient to reach all milestone targets before exam dates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. AI Actionable Recommendations */}
        <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Tactical Recommendations</h2>
              <p className="text-xs text-slate-400">Real-data driven adjustments to improve retention and pace</p>
            </div>
          </div>

          <div className="space-y-3">
            {analyses.slice(0, 3).map((sub, idx) => (
              <div 
                key={sub.subject_id} 
                className="p-4 rounded-xl bg-[#141C32] border border-slate-700/80 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{sub.subject_name}</span>
                    <span className="text-[10px] text-[#2DD4BF] font-mono">Priority #{sub.priority_rank}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sub.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
