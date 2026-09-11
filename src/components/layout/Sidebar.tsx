import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ListTree, 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  GraduationCap, 
  Target, 
  BarChart3, 
  FileText, 
  CalendarDays, 
  Bell, 
  Settings, 
  LogOut,
  Flame,
  User,
  Award,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyPlanLogo } from '../common/StudyPlanLogo';

export type ActiveTab = 
  | 'dashboard' 
  | 'subjects' 
  | 'syllabus' 
  | 'ai-planner' 
  | 'calendar' 
  | 'tasks' 
  | 'daily-tasks'
  | 'exams' 
  | 'goals' 
  | 'analytics' 
  | 'reports'
  | 'weekly-reports' 
  | 'monthly-reports' 
  | 'notifications' 
  | 'settings'
  | 'evaluation';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { profile, logout, notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  const mainNavItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'evaluation', label: 'Project Evaluation', icon: Award, badge: 'Dossier', badgeColor: 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40' },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus', icon: ListTree },
    { id: 'ai-planner', label: 'AI Study Planner', icon: Sparkles, badge: 'AI', badgeColor: 'bg-[#7C3AED]/30 text-[#2DD4BF] border border-[#7C3AED]/50' },
    { id: 'calendar', label: 'Smart Calendar', icon: Calendar },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'weekly-reports', label: 'Weekly Reports', icon: FileText },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: CalendarDays },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40' },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-68 bg-[#0B1020] border-r border-slate-800/80
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto shrink-0 select-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top: Aesthetic StudyPlan AI Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
          <StudyPlanLogo size="sm" />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 lg:hidden transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>

          {mainNavItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                  active 
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className={active ? 'glow-stat-purple' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-[#7C3AED]/20 text-[#2DD4BF]')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Profile, Settings, Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0E1528] space-y-2">
          {/* Profile mini-card */}
          <div 
            onClick={() => handleSelect('settings')}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-[#131B30] border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#2DD4BF] p-0.5 shrink-0">
              <div className="w-full h-full rounded-[6px] bg-[#0B1020] flex items-center justify-center text-slate-200 font-bold text-xs">
                {profile?.full_name ? profile.full_name.charAt(0) : 'S'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                {profile?.full_name || 'Alex Kumar'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {profile?.college || profile?.course || 'Computer Science'}
              </p>
            </div>
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F472B6]/10 border border-[#F472B6]/30 text-[#F472B6] text-[10px] font-bold shrink-0" title="Study Streak">
              <Flame className="w-3 h-3 fill-[#F472B6]" />
              <span>{profile?.current_streak_days || 0}d</span>
            </div>
          </div>

          {/* Settings and Logout Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSelect('settings')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-[#F472B6] hover:bg-[#F472B6]/10 border border-slate-800/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
