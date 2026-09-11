import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Clock, 
  Calendar, 
  Check, 
  Trash2, 
  Sparkles,
  BookOpen,
  Filter,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  X,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudySession } from '../types';
import { formatDateStr } from '../lib/plannerAlgorithm';

export const DailyTasksView: React.FC = () => {
  const { 
    studySessions, 
    subjects, 
    profile, 
    dailyProgress,
    markSessionCompleted, 
    markSessionMissed, 
    updateStudySession,
    addStudySession,
    deleteStudySession
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');
  const [activeTimerSession, setActiveTimerSession] = useState<StudySession | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

  // Manual quick task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubjectId, setNewTaskSubjectId] = useState(subjects[0]?.id || '');
  const [newTaskDuration, setNewTaskDuration] = useState(60);

  const todayStr = formatDateStr(new Date());

  // Filter today's sessions
  const todaysSessions = useMemo(() => {
    return studySessions.filter(s => s.session_date === todayStr && s.status !== 'Cancelled');
  }, [studySessions, todayStr]);

  // Today's stats calculation
  const todayProgressItem = dailyProgress.find(p => p.date === todayStr);
  const completedMinutesToday = todaysSessions
    .filter(s => s.status === 'Completed')
    .reduce((acc, s) => acc + (s.duration_minutes || s.planned_duration_minutes || 60), 0);
  const targetMinutesToday = (profile?.daily_available_hours || 4) * 60;
  const completedTasksCount = todaysSessions.filter(s => s.status === 'Completed').length;
  const pendingTasksCount = todaysSessions.filter(s => s.status === 'Planned').length;
  const missedTasksCount = todaysSessions.filter(s => s.status === 'Missed').length;

  const efficiencyScore = todaysSessions.length > 0 
    ? Math.round((completedTasksCount / todaysSessions.length) * 100) 
    : 100;

  // Filtered session list
  const filteredSessions = useMemo(() => {
    if (activeFilter === 'pending') return todaysSessions.filter(s => s.status === 'Planned');
    if (activeFilter === 'completed') return todaysSessions.filter(s => s.status === 'Completed');
    if (activeFilter === 'missed') return todaysSessions.filter(s => s.status === 'Missed');
    return todaysSessions;
  }, [todaysSessions, activeFilter]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const handleStartTimer = (session: StudySession) => {
    setActiveTimerSession(session);
    setTimerSecondsLeft((session.planned_duration_minutes || 60) * 60);
    setIsTimerRunning(true);
    setTimerMode('focus');
  };

  const handleFinishTimer = async () => {
    if (activeTimerSession) {
      await markSessionCompleted(activeTimerSession.id);
      setActiveTimerSession(null);
      setIsTimerRunning(false);
    }
  };

  const handleCreateTodayTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const sub = subjects.find(s => s.id === newTaskSubjectId);
    const now = new Date();
    const startHH = String(now.getHours()).padStart(2, '0');
    const startMM = String(now.getMinutes()).padStart(2, '0');
    const endMinutes = now.getHours() * 60 + now.getMinutes() + newTaskDuration;
    const endHH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
    const endMM = String(endMinutes % 60).padStart(2, '0');

    await addStudySession({
      subject_id: newTaskSubjectId,
      title: newTaskTitle.trim(),
      session_date: todayStr,
      start_time: `${startHH}:${startMM}`,
      end_time: `${endHH}:${endMM}`,
      duration_minutes: newTaskDuration,
      planned_duration_minutes: newTaskDuration,
      status: 'Planned',
      notes: 'Added from Today’s Action Checklist',
    });

    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Real-Time KPIs */}
      <div className="bg-[#111728] p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-800/50">
                Daily Study Execution
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              Today&rsquo;s Scheduled Tasks &amp; Focus Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates calculate study minutes, subject syllabus completion, and daily efficiency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0B1020] text-slate-300 border border-slate-800">
              Capacity: {profile?.daily_available_hours || 4}h ({targetMinutesToday}m)
            </span>
          </div>
        </div>

        {/* Real-Time Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-slate-800">
            <span className="text-slate-400 text-[11px] font-semibold block mb-0.5">Focus Minutes Completed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">{completedMinutesToday}</span>
              <span className="text-xs text-slate-400 font-medium">/ {targetMinutesToday}m</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-violet-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((completedMinutesToday / targetMinutesToday) * 100))}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-slate-800">
            <span className="text-slate-400 text-[11px] font-semibold block mb-0.5">Tasks Completed</span>
            <div className="text-xl font-bold text-teal-400">
              {completedTasksCount} <span className="text-xs text-slate-400 font-normal">/ {todaysSessions.length} total</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {pendingTasksCount} pending, {missedTasksCount} missed
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-slate-800">
            <span className="text-slate-400 text-[11px] font-semibold block mb-0.5">Today&rsquo;s Efficiency</span>
            <div className="text-xl font-bold text-violet-400">
              {efficiencyScore}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Based on on-time completions
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-slate-800">
            <span className="text-slate-400 text-[11px] font-semibold block mb-0.5">Focus Window</span>
            <div className="text-sm font-bold text-slate-200">
              {profile?.preferred_study_start_time || '18:00'} – {profile?.preferred_study_end_time || '22:00'}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {profile?.preferred_study_period || 'Evening'} Slot
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Session for Today */}
      <form 
        onSubmit={handleCreateTodayTask} 
        className="bg-[#111728] p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          placeholder="Add an actionable study task for today (e.g. Solve 10 questions, read Chapter 4)..."
          className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-700 bg-[#0B1020] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          required
        />
        <select
          value={newTaskSubjectId}
          onChange={e => setNewTaskSubjectId(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id} className="bg-[#111728] text-white">{s.name}</option>
          ))}
        </select>
        <select
          value={newTaskDuration}
          onChange={e => setNewTaskDuration(parseInt(e.target.value, 10))}
          className="px-3 py-2 text-xs rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
        >
          <option value={30} className="bg-[#111728] text-white">30 mins</option>
          <option value={45} className="bg-[#111728] text-white">45 mins</option>
          <option value={60} className="bg-[#111728] text-white">60 mins</option>
          <option value={90} className="bg-[#111728] text-white">90 mins</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Task Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed', 'missed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeFilter === tab
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-[#111728] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab} ({
                tab === 'all' 
                  ? todaysSessions.length 
                  : tab === 'pending' 
                  ? pendingTasksCount 
                  : tab === 'completed' 
                  ? completedTasksCount 
                  : missedTasksCount
              })
            </button>
          ))}
        </div>
      </div>

      {/* Task Items List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-[#111728] rounded-2xl p-12 text-center border border-slate-800 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No tasks in this category</h4>
            <p className="text-xs text-slate-400 mt-1">
              All tasks for this filter have been completed or none are scheduled.
            </p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const subject = subjects.find(s => s.id === session.subject_id);
            const isCompleted = session.status === 'Completed';
            const isMissed = session.status === 'Missed';

            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80' 
                    : isMissed
                    ? 'bg-rose-950/20 border-rose-800/40'
                    : 'bg-[#111728] border-slate-800 shadow-sm hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator / Fast Complete Clicker */}
                  <button
                    onClick={() => {
                      if (isCompleted) {
                        updateStudySession(session.id, { status: 'Planned' });
                      } else {
                        markSessionCompleted(session.id);
                      }
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all mt-0.5 shrink-0 cursor-pointer ${
                      isCompleted 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : isMissed
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 hover:bg-rose-900'
                        : 'border-2 border-slate-700 hover:border-violet-500 text-transparent hover:text-violet-400'
                    }`}
                    title={isCompleted ? 'Mark as pending' : 'Click to complete'}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: subject?.color || '#7C3AED' }}
                      >
                        {subject?.name}
                      </span>
                      <h4 className={`text-sm font-bold text-white ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {session.title}
                      </h4>
                      {session.is_revision && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                          Pre-Exam Revision
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {session.notes || 'Core curriculum mastery & active practice'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span>{session.start_time} – {session.end_time}</span>
                      <span>•</span>
                      <span>{session.duration_minutes} Mins</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!isCompleted && !isMissed && (
                    <>
                      {/* Pomodoro Timer Launch Button */}
                      <button
                        onClick={() => handleStartTimer(session)}
                        className="px-3 py-2 text-xs font-semibold text-violet-300 bg-violet-950/60 hover:bg-violet-900/80 rounded-xl transition-all flex items-center gap-1.5 border border-violet-800/60 cursor-pointer"
                        title="Start Pomodoro Focus Timer"
                      >
                        <Play className="w-3.5 h-3.5 fill-violet-300" />
                        <span>Focus Timer</span>
                      </button>

                      {/* Mark Completed Button */}
                      <button
                        onClick={() => markSessionCompleted(session.id)}
                        className="px-3 py-2 text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 rounded-xl transition-all flex items-center gap-1.5 border border-teal-800/60 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </button>

                      {/* Mark Missed Button (triggers AI automatic reschedule) */}
                      <button
                        onClick={() => markSessionMissed(session.id)}
                        className="px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 rounded-xl transition-all flex items-center gap-1.5 border border-rose-800/60 cursor-pointer"
                        title="Mark missed and auto-reschedule to next available slot"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Missed</span>
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5 bg-teal-950/80 px-3 py-1.5 rounded-xl border border-teal-800/50">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Finished (+{session.duration_minutes}m)</span>
                    </span>
                  )}

                  {isMissed && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1 bg-rose-950/80 px-3 py-1.5 rounded-xl border border-rose-800/50">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Missed</span>
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => deleteStudySession(session.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOCUS / POMODORO TIMER MODAL */}
      {activeTimerSession && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#111728] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 text-center space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-violet-950/80 px-2.5 py-1 rounded-full border border-violet-800/60">
                Pomodoro Focus Mode
              </span>
              <button
                onClick={() => {
                  setActiveTimerSession(null);
                  setIsTimerRunning(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {activeTimerSession.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Subject: {subjects.find(s => s.id === activeTimerSession.subject_id)?.name}
              </p>
            </div>

            {/* Countdown Display */}
            <div className="py-6">
              <div className="text-6xl font-black font-mono tracking-tight text-white">
                {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>
              <span className="text-xs font-medium text-slate-400 mt-2 block">
                {isTimerRunning ? 'Deep Focus Session in Progress' : 'Timer Paused'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-md shadow-violet-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => setTimerSecondsLeft((activeTimerSession.planned_duration_minutes || 60) * 60)}
                className="p-3 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleFinishTimer}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Finish &amp; Mark Session Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
