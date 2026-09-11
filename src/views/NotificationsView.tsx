import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Flame,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  ShieldAlert,
  Sparkles,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationType, NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    clearAllNotifications, 
    markNotificationRead,
    addNotification,
    exams,
    subjects,
    studySessions
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<'all' | 'unread' | 'exams' | 'sessions' | 'risk'>('all');

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'exam':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case 'session':
        return <Clock className="w-4 h-4 text-violet-400" />;
      case 'risk':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'task':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'deadline':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'goal':
      case 'streak':
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'exam':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">Exam Milestone</span>;
      case 'session':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60">Study Session</span>;
      case 'risk':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">Academic Risk</span>;
      case 'report':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60">Audit Report</span>;
      case 'task':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">Pending Task</span>;
      case 'deadline':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-300 border border-orange-800/60">Deadline</span>;
      case 'goal':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/60">Goal Done</span>;
      case 'streak':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">Streak</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B1020] text-slate-400 border border-slate-800">System</span>;
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const isRead = n.is_read || n.read;
      if (filterCategory === 'unread') return !isRead;
      if (filterCategory === 'exams') return n.type === 'exam' || n.type === 'deadline';
      if (filterCategory === 'sessions') return n.type === 'session' || n.type === 'task' || n.type === 'reminder';
      if (filterCategory === 'risk') return n.type === 'risk' || n.type === 'report';
      return true;
    });
  }, [notifications, filterCategory]);

  const unreadCount = notifications.filter(n => !(n.is_read || n.read)).length;

  const handleTriggerTestAlert = () => {
    const randomTypes: Array<{ title: string; message: string; type: NotificationType }> = [
      {
        title: 'Study Session Approaching',
        message: 'Upcoming focus block for Python Algorithms begins in 20 minutes.',
        type: 'session'
      },
      {
        title: 'High-Risk Exam Warning',
        message: 'Mathematics mid-term is 8 days away and remaining topics require ~6 study hours.',
        type: 'risk'
      },
      {
        title: 'Weekly Academic Report Ready',
        message: 'Your Monday → Sunday academic velocity report has been audited and compiled.',
        type: 'report'
      }
    ];

    const pick = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    addNotification({
      user_id: 'demo-user',
      title: pick.title,
      message: pick.message,
      type: pick.type,
      is_read: false,
      read: false,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-800/50">
              In-App Academic Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white">Notifications & Academic Alerts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time updates for approaching exams, study sessions, missed tasks, risks, and reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerTestAlert}
            className="px-3 py-2 rounded-xl bg-violet-950/80 hover:bg-violet-900/80 text-violet-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-violet-800/60 cursor-pointer"
            title="Generate a sample academic notification"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Alert</span>
          </button>
          <button
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="px-3 py-2 rounded-xl border border-rose-800/50 hover:bg-rose-950/40 text-xs font-semibold text-rose-400 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0B1020] p-1.5 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'exams', label: 'Exams & Deadlines' },
          { id: 'sessions', label: 'Sessions & Tasks' },
          { id: 'risk', label: 'Risks & Reports' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === tab.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#111728] rounded-2xl border border-slate-800 p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No notifications in this filter</h4>
            <p className="text-xs text-slate-400 mt-1">
              You are caught up with all academic milestones and scheduled session reminders.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isRead = n.is_read || n.read;
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isRead 
                    ? 'bg-[#111728] border-slate-800 hover:border-slate-700 text-slate-300' 
                    : 'bg-[#111728] border-violet-700/60 shadow-sm hover:border-violet-600 text-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#0B1020] border border-slate-800 shadow-sm shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm font-bold ${isRead ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      {getTypeBadge(n.type)}
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(n.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-slate-800 transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
