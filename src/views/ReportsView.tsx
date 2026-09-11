import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  Award,
  ChevronRight,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateWeeklyReport, generateMonthlyReport } from '../lib/analyticsEngine';

interface ReportsViewProps {
  initialTab?: 'weekly' | 'monthly';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ initialTab = 'weekly' }) => {
  const { 
    profile, 
    subjects, 
    topics, 
    exams, 
    goals, 
    dailyProgress, 
    studySessions, 
    getSubjectProgress 
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'weekly' | 'monthly'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  // Compute Weekly Report data
  const weeklyData = useMemo(() => {
    return generateWeeklyReport(
      studySessions,
      dailyProgress,
      subjects,
      topics,
      profile,
      getSubjectProgress
    );
  }, [studySessions, dailyProgress, subjects, topics, profile, getSubjectProgress]);

  // Compute Monthly Report data
  const monthlyData = useMemo(() => {
    return generateMonthlyReport(
      studySessions,
      dailyProgress,
      subjects,
      topics,
      getSubjectProgress
    );
  }, [studySessions, dailyProgress, subjects, topics, getSubjectProgress]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controls Bar */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-800/50">
              Automated Academic Audits
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Weekly & Monthly Performance Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official progress verification reports for academic tracking and self-assessment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#0B1020] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveReportTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeReportTab === 'weekly'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Report (Mon–Sun)
            </button>
            <button
              onClick={() => setActiveReportTab('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeReportTab === 'monthly'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Summary
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Print or export report to PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* REPORT PAPER CONTAINER */}
      <div className="bg-[#111728] rounded-2xl border border-slate-800 shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span className="text-xs font-black uppercase tracking-widest text-violet-400 font-mono">
                STUDYPLAN AI AUDIT VERIFICATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {profile?.full_name || 'Mari Ganesh'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {profile?.college_or_course || 'B.Tech in Computer Science'} • {profile?.semester_or_year || 'Semester 5'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
            <span className="block font-bold text-slate-200">
              {activeReportTab === 'weekly' ? 'Week Audit: ' + weeklyData.week_range : 'Month Audit: ' + monthlyData.month_name}
            </span>
            <span className="block">Report Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
            <span className="inline-block px-2 py-0.5 rounded bg-[#0B1020] border border-slate-800 font-mono text-[10px] text-slate-400">
              ID: SP-AUDIT-{Math.floor(Date.now() / 100000)}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WEEKLY REPORT VIEW */}
        {/* ========================================================================= */}
        {activeReportTab === 'weekly' && (
          <div className="space-y-8">
            {/* Week-over-Week Headline Comparison Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-[#0B1020] to-indigo-950/80 border border-violet-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-300">
                  Weekly Goal Achievement
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black">{weeklyData.achievement_percentage}%</span>
                  <span className="text-sm font-bold text-teal-400 flex items-center gap-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                    +{weeklyData.improvement_percentage}% vs Last Week
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Last Week: {weeklyData.previous_week_achievement}% &rarr; This Week: {weeklyData.achievement_percentage}% (Improvement: +{weeklyData.improvement_percentage}%)
                </p>
              </div>

              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Consistency Score</span>
                  <span className="text-xl font-bold text-white">{weeklyData.consistency_score}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Active Streak</span>
                  <span className="text-xl font-bold text-amber-400">{weeklyData.study_streak} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Rescheduled</span>
                  <span className="text-xl font-bold text-violet-300">{weeklyData.rescheduled_sessions}</span>
                </div>
              </div>
            </div>

            {/* Weekly KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Planned Study</span>
                <span className="text-2xl font-black text-white mt-1 block">{weeklyData.planned_hours} hrs</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{profile?.weekly_study_target_hours || 24}h target</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Actual Logged</span>
                <span className="text-2xl font-black text-violet-400 mt-1 block">{weeklyData.actual_hours} hrs</span>
                <span className="text-[10px] text-teal-400 font-semibold mt-0.5 block">High efficiency</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Tasks Completed</span>
                <span className="text-2xl font-black text-teal-400 mt-1 block">
                  {weeklyData.tasks_completed} / {weeklyData.tasks_planned}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {weeklyData.tasks_missed} missed session(s)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Consistency</span>
                <span className="text-2xl font-black text-violet-400 mt-1 block">{weeklyData.consistency_score}%</span>
                <span className="text-[10px] text-violet-300 font-semibold mt-0.5 block">Daily active habit</span>
              </div>
            </div>

            {/* Grounded Weekly AI Analysis Section */}
            <div className="bg-[#0B1020] rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-white">Weekly AI Synthesis & Academic Analysis</h3>
              </div>

              <div className="space-y-2.5">
                {weeklyData.ai_insights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-[#111728] border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Mastery Progress Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white">Subject Progress & Weekly Delta Breakdown</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0B1020] border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Current Syllabus Mastery</th>
                      <th className="p-3.5">Weekly Improvement</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {weeklyData.subject_progress.map(sub => (
                      <tr key={sub.subject_name} className="hover:bg-slate-800/20">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span>{sub.subject_name}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: `${sub.progress}%`, backgroundColor: sub.color }} 
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-200">{sub.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-teal-400 bg-teal-950/60 border border-teal-800/50 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            +{sub.weekly_delta}%
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {sub.progress >= 70 ? 'On Track' : 'Needs Practice'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MONTHLY REPORT VIEW */}
        {/* ========================================================================= */}
        {activeReportTab === 'monthly' && (
          <div className="space-y-8">
            {/* Month-over-Month Comparison Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-[#0B1020] to-indigo-950/80 border border-violet-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-300">
                  Monthly Hours Expansion
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black">{monthlyData.total_study_hours} hrs</span>
                  <span className="text-sm font-bold text-teal-400 flex items-center gap-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                    +{monthlyData.monthly_improvement_percentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Previous Month: {monthlyData.monthly_hours_previous} hrs &rarr; {monthlyData.month_name}: {monthlyData.total_study_hours} hrs (+{monthlyData.monthly_improvement_percentage}%)
                </p>
              </div>

              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Daily Average</span>
                  <span className="text-xl font-bold text-white">{monthlyData.average_daily_hours} hrs/day</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Consistency</span>
                  <span className="text-xl font-bold text-violet-300">{monthlyData.consistency_score}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Rescheduled</span>
                  <span className="text-xl font-bold text-slate-200">{monthlyData.rescheduled_sessions}</span>
                </div>
              </div>
            </div>

            {/* Monthly KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Study Hours</span>
                <span className="text-2xl font-black text-white mt-1 block">{monthlyData.total_study_hours} hrs</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{monthlyData.average_daily_hours}h daily avg</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Completed Topics</span>
                <span className="text-2xl font-black text-teal-400 mt-1 block">{monthlyData.completed_topics}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{monthlyData.completed_tasks} study tasks done</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Strongest Subject</span>
                <span className="text-base font-bold text-teal-400 mt-1.5 block truncate">
                  {monthlyData.strongest_subject}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Highest syllabus pace</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Subject at Risk</span>
                <span className="text-base font-bold text-amber-400 mt-1.5 block truncate">
                  {monthlyData.weakest_subject}
                </span>
                <span className="text-[10px] text-rose-400 font-semibold mt-0.5 block">Requires priority</span>
              </div>
            </div>

            {/* Executive Synthesis */}
            <div className="p-6 rounded-2xl bg-[#0B1020] border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-white">Monthly Academic Retrospective</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                During <span className="font-bold text-white">{monthlyData.month_name}</span>, you accumulated 
                <span className="font-bold text-violet-400"> {monthlyData.total_study_hours} hours</span> of focused preparation, 
                representing a <span className="font-bold text-teal-400">+{monthlyData.monthly_improvement_percentage}% improvement</span> compared to the preceding cycle. 
                Your habit consistency reached <span className="font-bold text-white">{monthlyData.consistency_score}%</span> across active days. 
                Syllabus progress in <span className="font-bold text-white">{monthlyData.strongest_subject}</span> accelerated ahead of syllabus milestones, while 
                <span className="font-bold text-rose-400"> {monthlyData.weakest_subject}</span> should remain your primary target for next month's focus blocks.
              </p>
            </div>
          </div>
        )}

        {/* Official Signoff Footer */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>StudyPlan AI — Continuous Learning Analytics Engine</span>
          <span className="font-mono">Audited from student data records</span>
        </div>
      </div>
    </div>
  );
};
