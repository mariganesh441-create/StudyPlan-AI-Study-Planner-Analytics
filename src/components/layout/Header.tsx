import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Plus, 
  Flame, 
  Clock, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Calendar,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  onOpenQuickSession: () => void;
  onOpenAddSubject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenQuickSession,
  onOpenAddSubject,
}) => {
  const { 
    profile, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    resetToSampleData,
    theme,
    setTheme
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Student Dashboard', subtitle: 'Real-time academic performance & study analytics' },
    evaluation: { title: 'Project Evaluation & Academic Dossier', subtitle: 'Architecture overview, user validation logs, and system evidence' },
    subjects: { title: 'My Subjects', subtitle: 'Manage enrolled courses, targets, and knowledge scores' },
    syllabus: { title: 'Syllabus & Topics', subtitle: 'Course modular breakdowns, duration estimates & progress' },
    'ai-planner': { title: 'AI Study Planner', subtitle: 'Personalized schedule generation based on exams & difficulty' },
    calendar: { title: 'Academic Calendar', subtitle: 'Exam milestones, study slots, and deadline schedule' },
    tasks: { title: 'Daily Study Tasks', subtitle: 'Prioritized daily learning checklist & topic tracker' },
    'daily-tasks': { title: 'Daily Study Tasks', subtitle: 'Prioritized daily learning checklist & topic tracker' },
    exams: { title: 'Exams & Milestones', subtitle: 'Countdown schedules, target scores & syllabus coverage' },
    goals: { title: 'Study Goals', subtitle: 'Long-term milestones, metrics, and progress tracking' },
    analytics: { title: 'Progress Analytics', subtitle: 'Comprehensive charts, efficiency ratings & study trends' },
    reports: { title: 'Progress Reports', subtitle: 'Comprehensive study consistency and syllabus completion review' },
    'weekly-reports': { title: 'Weekly Reports', subtitle: '7-day study consistency and time allocation review' },
    'monthly-reports': { title: 'Monthly Reports', subtitle: 'Month-over-month academic momentum and completion rates' },
    notifications: { title: 'Notification Center', subtitle: 'Exam alerts, streak reminders and AI recommendations' },
    settings: { title: 'Student Profile & Settings', subtitle: 'Study hours, preferred time slots, and Supabase integration' },
  };

  const currentMeta = tabTitles[activeTab] || { title: 'StudyPlan AI', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-[#0B1020]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 glow-title">
              {currentMeta.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions, notifications, streak & profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Study Session Logger */}
          <button
            onClick={onOpenQuickSession}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] hover:bg-[#2DD4BF]/20 text-xs font-semibold border border-[#2DD4BF]/30 transition-all cursor-pointer shadow-xs shadow-[#2DD4BF]/10"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Study</span>
          </button>

          {/* Quick Add Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-xs font-semibold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Quick Add</span>
            </button>

            {showQuickMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowQuickMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#111728] rounded-2xl shadow-2xl border border-slate-800/90 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAddSubject(); }}
                    className="w-full text-left px-3.5 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                    <span>Add New Subject</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenQuickSession(); }}
                    className="w-full text-left px-3.5 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Log Study Session</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); setActiveTab('exams'); }}
                    className="w-full text-left px-3.5 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#F472B6]" />
                    <span>Schedule Exam</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); setActiveTab('goals'); }}
                    className="w-full text-left px-3.5 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <span>Set Milestone Goal</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Streak indicator */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F472B6]/10 border border-[#F472B6]/30 text-[#F472B6] text-xs font-bold shadow-xs shadow-[#F472B6]/10"
            title={`${profile?.current_streak_days || 0}-day study streak active`}
          >
            <Flame className="w-4 h-4 text-[#F472B6] fill-[#F472B6]" />
            <span className="hidden sm:inline">{profile?.current_streak_days || 0} Day Streak</span>
            <span className="sm:hidden">{profile?.current_streak_days || 0}d</span>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F472B6] ring-2 ring-[#0B1020]" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111728] rounded-2xl shadow-2xl border border-slate-800/90 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#2DD4BF] hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications at the moment
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(item => (
                        <div 
                          key={item.id}
                          onClick={() => markNotificationRead(item.id)}
                          className={`p-3 text-xs hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            !item.read ? 'bg-[#7C3AED]/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-200">{item.title}</span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{item.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-800/80 text-center">
                    <button
                      onClick={() => { setShowNotifications(false); setActiveTab('notifications'); }}
                      className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      View all notifications &rarr;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Data button for easy evaluator testing */}
          <button
            onClick={() => {
              if (confirm('Reset to standard realistic student demo data (DSA, Python, DBMS, Exams, Goals)?')) {
                resetToSampleData();
              }
            }}
            title="Reset sample data"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
