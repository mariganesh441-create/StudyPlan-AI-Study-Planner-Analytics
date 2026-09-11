import React, { useState } from 'react';
import { 
  User, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  Save, 
  Clock, 
  Bell, 
  Moon, 
  Sun, 
  Laptop, 
  Download, 
  Trash2, 
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    resetToSampleData, 
    theme, 
    setTheme, 
    notificationSettings, 
    updateNotificationSettings,
    exportAllAcademicData,
    clearAllUserData
  } = useApp();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [collegeOrCourse, setCollegeOrCourse] = useState(profile?.college || profile?.college_or_course || '');
  const [semesterOrYear, setSemesterOrYear] = useState(profile?.semester || profile?.semester_or_year || '');
  const [dailyHours, setDailyHours] = useState(profile?.daily_available_hours || 4);
  const [startTime, setStartTime] = useState(profile?.preferred_study_start_time || '18:00');
  const [endTime, setEndTime] = useState(profile?.preferred_study_end_time || '22:00');
  const [preferredPeriod, setPreferredPeriod] = useState(profile?.preferred_study_period || 'Evening');
  const [weeklyTarget, setWeeklyTarget] = useState(profile?.weekly_study_target_hours || 24);
  const [targetGpa, setTargetGpa] = useState(profile?.target_gpa || 3.8);

  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      college: collegeOrCourse,
      semester: semesterOrYear,
      daily_available_hours: Number(dailyHours),
      preferred_study_start_time: startTime,
      preferred_study_end_time: endTime,
      preferred_study_period: preferredPeriod as any,
      weekly_study_target_hours: Number(weeklyTarget),
      target_gpa: Number(targetGpa),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    exportAllAcademicData();
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure? This will delete all your subjects, topics, exams, study schedules, and local progress!')) {
      clearAllUserData();
    }
  };

  const copySqlSchema = () => {
    const schemaSql = `-- StudyPlan AI PostgreSQL Schema
-- Tables: profiles, subjects, topics, exams, goals, study_sessions, daily_progress, notifications, ai_insights
-- (See /supabase/schema.sql for the full production migration with RLS policies)`;
    navigator.clipboard.writeText(schemaSql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Settings & Preferences</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage student profile, study schedules, smart notifications, dark theme, and database backup
          </p>
        </div>
        {isSaved && (
          <div className="px-3 py-1 rounded-xl bg-teal-950/60 text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-teal-800/60 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Appearance & Dark Mode */}
      <div className="bg-[#111728] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-950/80 text-violet-300 border border-violet-800/50">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Theme & Appearance</h3>
            <p className="text-xs text-slate-400">Choose light or dark mode for late-night study sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-violet-500 bg-violet-950/60 text-violet-300 font-bold ring-2 ring-violet-500/20'
                : 'border-slate-800 hover:bg-slate-800/60 text-slate-400 font-medium'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="text-xs">Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-violet-500 bg-violet-950/60 text-violet-300 font-bold ring-2 ring-violet-500/20'
                : 'border-slate-800 hover:bg-slate-800/60 text-slate-400 font-medium'
            }`}
          >
            <Moon className="w-5 h-5 text-violet-400" />
            <span className="text-xs">Dark Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'system'
                ? 'border-violet-500 bg-violet-950/60 text-violet-300 font-bold ring-2 ring-violet-500/20'
                : 'border-slate-800 hover:bg-slate-800/60 text-slate-400 font-medium'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-400" />
            <span className="text-xs">System Match</span>
          </button>
        </div>
      </div>

      {/* Student Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-[#111728] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-950/80 text-violet-300 border border-violet-800/50">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Student Profile Information</h3>
            <p className="text-xs text-slate-400">Personal information and academic institution details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College / University / Major</label>
            <input
              type="text"
              value={collegeOrCourse}
              onChange={(e) => setCollegeOrCourse(e.target.value)}
              placeholder="e.g. Apex Institute of Technology (B.Tech CS)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white placeholder-slate-500 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Semester / Academic Year</label>
            <input
              type="text"
              value={semesterOrYear}
              onChange={(e) => setSemesterOrYear(e.target.value)}
              placeholder="e.g. Semester 5"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white placeholder-slate-500 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Academic Percentage / GPA</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="100"
              value={targetGpa}
              onChange={(e) => setTargetGpa(parseFloat(e.target.value) || 85)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Study Time Preferences */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Study Time Preferences & Scheduling Parameters</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Available Hours</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value) || 4)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm font-medium focus:border-violet-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 shrink-0">hrs/day</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Target Goal</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(parseFloat(e.target.value) || 24)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm font-medium focus:border-violet-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 shrink-0">hrs/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Study Period</label>
              <select
                value={preferredPeriod}
                onChange={(e) => setPreferredPeriod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm font-medium focus:border-violet-500 focus:outline-none"
              >
                <option value="Morning" className="bg-[#111728] text-white">Morning (06:00 - 10:00)</option>
                <option value="Afternoon" className="bg-[#111728] text-white">Afternoon (12:00 - 16:00)</option>
                <option value="Evening" className="bg-[#111728] text-white">Evening (18:00 - 22:00)</option>
                <option value="Night" className="bg-[#111728] text-white">Late Night (22:00 - 02:00)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Study Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm font-medium focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Study End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1020] text-white text-sm font-medium focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-600/20 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Preferences</span>
          </button>
        </div>
      </form>

      {/* Notification Settings */}
      <div className="bg-[#111728] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/50">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Notification Settings</h3>
            <p className="text-xs text-slate-400">Control system alerts, exam countdowns, and rescheduling suggestions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.exam_alerts}
              onChange={(e) => updateNotificationSettings({ exam_alerts: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Upcoming Exam Alerts</p>
              <p className="text-[11px] text-slate-400">Notify 7 days, 3 days, and 1 day prior to scheduled exams</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.session_reminders}
              onChange={(e) => updateNotificationSettings({ session_reminders: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Daily Session Reminders</p>
              <p className="text-[11px] text-slate-400">Remind 15 minutes before study sessions begin</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.missed_session_alerts}
              onChange={(e) => updateNotificationSettings({ missed_session_alerts: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Automatic Rescheduling Notices</p>
              <p className="text-[11px] text-slate-400">Propose recovery slots immediately when a session is marked missed</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.risk_warnings}
              onChange={(e) => updateNotificationSettings({ risk_warnings: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Subject Risk Warnings</p>
              <p className="text-[11px] text-slate-400">Alert if syllabus progress falls behind exam timeline threshold</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.weekly_reports}
              onChange={(e) => updateNotificationSettings({ weekly_reports: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Weekly Performance Digest</p>
              <p className="text-[11px] text-slate-400">Deliver AI summary report every Sunday evening</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0B1020] hover:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.streak_milestones}
              onChange={(e) => updateNotificationSettings({ streak_milestones: e.target.checked })}
              className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-700 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-white">Streak & Consistency Badges</p>
              <p className="text-[11px] text-slate-400">Celebrate milestone achievements and consistency streaks</p>
            </div>
          </label>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-[#111728] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-950/80 text-violet-300 border border-violet-800/50">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Data Export & Portability</h3>
            <p className="text-xs text-slate-400">Export your complete academic records and study logs in JSON format</p>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Download a complete backup archive of your student profile, subjects, syllabus topics, exams, goals, study history, and AI insights. You can use this file for external backups or migrating between accounts.
        </p>

        <div>
          <button
            type="button"
            onClick={handleExportData}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isExported ? <Check className="w-4 h-4 text-teal-400" /> : <Download className="w-4 h-4 text-violet-400" />}
            <span>{isExported ? 'Data Exported Successfully!' : 'Export All Academic Data (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Supabase & Backend Architecture Card */}
      <div className="bg-[#111728] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-300 border border-teal-800/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase & PostgreSQL Status</h3>
              <p className="text-xs text-slate-400">Database connection and schema provisioning</p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            isSupabaseConfigured 
              ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60' 
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-teal-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Persistence (Demo Mode)'}</span>
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The complete database migration schema is available in <code className="bg-[#0B1020] border border-slate-800 px-1.5 py-0.5 rounded text-violet-300 font-mono">/supabase/schema.sql</code>. 
          When you add <code className="bg-[#0B1020] border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">VITE_SUPABASE_URL</code> and <code className="bg-[#0B1020] border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">VITE_SUPABASE_ANON_KEY</code> to your environment, 
          the application seamlessly syncs with your remote PostgreSQL instance with full Row Level Security (RLS).
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={copySqlSchema}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Schema Path Copied!' : 'Copy SQL Schema Reference'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all demo data back to default initial state (Alex Kumar)?')) {
                resetToSampleData();
              }
            }}
            className="px-4 py-2 rounded-xl border border-amber-800/60 hover:bg-amber-950/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data (Alex Kumar)</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-800/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-800/30">
          <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-300">Danger Zone</h3>
            <p className="text-xs text-rose-400/80">Permanent data deletion and account reset</p>
          </div>
        </div>

        <p className="text-xs text-rose-300/80 leading-relaxed">
          Deleting your account or clearing all stored data will permanently remove all subjects, topics, study schedules, and progress history from local and cloud storage. This action cannot be undone.
        </p>

        <div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data & Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
