import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Clock, 
  Plus, 
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GripVertical,
  X,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Target,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudySession, SessionStatus } from '../types';
import { formatDateStr } from '../lib/plannerAlgorithm';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { 
    exams, 
    subjects, 
    goals, 
    studySessions, 
    addStudySession, 
    updateStudySession, 
    deleteStudySession, 
    markSessionCompleted, 
    markSessionMissed, 
    moveStudySession 
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // New session form state
  const [newSessionForm, setNewSessionForm] = useState({
    subject_id: subjects[0]?.id || '',
    title: '',
    session_date: formatDateStr(new Date()),
    start_time: '18:00',
    duration_minutes: 60,
    notes: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(nextDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, session: StudySession) => {
    e.dataTransfer.setData('text/plain', session.id);
    setDraggedSessionId(session.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('text/plain') || draggedSessionId;
    if (!sessionId) return;

    setConflictWarning(null);
    const result = await moveStudySession(sessionId, targetDateStr);
    if (!result.success && result.conflict) {
      setConflictWarning(result.conflict);
      setTimeout(() => setConflictWarning(null), 5000);
    }
    setDraggedSessionId(null);
  };

  // Add session submission
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find(s => s.id === newSessionForm.subject_id);
    const [h, m] = newSessionForm.start_time.split(':').map(Number);
    const endMinutes = h * 60 + m + newSessionForm.duration_minutes;
    const endHH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endMM = String(endMinutes % 60).padStart(2, '0');

    await addStudySession({
      subject_id: newSessionForm.subject_id,
      title: newSessionForm.title || `${sub?.name || 'Study'} Session`,
      session_date: newSessionForm.session_date,
      start_time: newSessionForm.start_time,
      end_time: `${endHH}:${endMM}`,
      duration_minutes: newSessionForm.duration_minutes,
      planned_duration_minutes: newSessionForm.duration_minutes,
      status: 'Planned',
      notes: newSessionForm.notes,
    });

    setIsAddSessionModalOpen(false);
    setNewSessionForm({
      subject_id: subjects[0]?.id || '',
      title: '',
      session_date: formatDateStr(new Date()),
      start_time: '18:00',
      duration_minutes: 60,
      notes: '',
    });
  };

  // Month computations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Week computations
  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    const day = current.getDay(); // 0 is Sunday
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - day);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Helpers to get items for specific date string YYYY-MM-DD
  const getSessionsForDate = (dateStr: string) => {
    return studySessions.filter(s => s.session_date === dateStr && s.status !== 'Cancelled');
  };

  const getExamsForDate = (dateStr: string) => {
    return exams.filter(e => e.exam_date === dateStr);
  };

  const getGoalsForDate = (dateStr: string) => {
    return goals.filter(g => g.target_date === dateStr);
  };

  const todayStr = formatDateStr(new Date());

  // Header Title
  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  }, [viewMode, currentDate, weekDays]);

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Top Controls */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Smart Academic Calendar</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/60 text-violet-400 font-semibold border border-violet-800/50">
              Drag &amp; Drop Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Color-coded timetable synchronized with Supabase database, exams, and auto-rescheduled slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View mode switcher */}
          <div className="flex items-center bg-[#0B1020] p-1 rounded-xl border border-slate-800">
            {(['month', 'week', 'day'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0B1020] text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl border border-slate-800 bg-[#0B1020] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 min-w-36 text-center">
              {headerTitle}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl border border-slate-800 bg-[#0B1020] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddSessionModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Conflict / Rule Alert */}
      {conflictWarning && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-medium text-rose-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
          <button onClick={() => setConflictWarning(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-[#111728] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          {/* Days of week */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0B1020] text-center py-2.5 text-xs font-bold text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-fr">
            {paddingDays.map(p => (
              <div key={`pad-${p}`} className="min-h-28 p-2 bg-[#0B1020]/40 border-b border-r border-slate-800/60" />
            ))}

            {daysArray.map(day => {
              const currentDayObj = new Date(year, month, day);
              const dateStr = formatDateStr(currentDayObj);
              const daySessions = getSessionsForDate(dateStr);
              const dayExams = getExamsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={`day-${day}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`min-h-28 p-2 border-b border-r border-slate-800/80 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-violet-950/20' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${
                      isToday ? 'bg-violet-600 text-white' : 'text-slate-300'
                    }`}>
                      {day}
                    </span>
                    {dayExams.length > 0 && (
                      <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/60">
                        Exam
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-24 scrollbar-none">
                    {/* Exam Pills */}
                    {dayExams.map(exam => (
                      <div
                        key={exam.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white truncate shadow-xs flex items-center gap-1"
                        title={`Exam: ${exam.name} at ${exam.exam_time || ''}`}
                      >
                        <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{exam.name}</span>
                      </div>
                    ))}

                    {/* Study Session Pills (Draggable) */}
                    {daySessions.map(session => {
                      const subject = subjects.find(s => s.id === session.subject_id);
                      const isCompleted = session.status === 'Completed';
                      const isMissed = session.status === 'Missed';

                      return (
                        <div
                          key={session.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, session)}
                          onClick={() => setSelectedSession(session)}
                          className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate transition-all cursor-pointer flex items-center justify-between gap-1 shadow-xs border ${
                            isCompleted 
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 line-through opacity-80' 
                              : isMissed
                              ? 'bg-rose-950/40 text-rose-300 border-rose-700/60'
                              : 'bg-[#0B1020] text-slate-200 border-slate-700 hover:border-violet-500 hover:shadow-sm'
                          }`}
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: subject?.color || '#7C3AED'
                          }}
                        >
                          <span className="truncate">
                            {session.start_time ? `${session.start_time} ` : ''}{session.title}
                          </span>
                          {isCompleted ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          ) : isMissed ? (
                            <X className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                          ) : (
                            <GripVertical className="w-2.5 h-2.5 text-slate-500 shrink-0 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-[#111728] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0B1020] divide-x divide-slate-800">
            {weekDays.map(date => {
              const dateStr = formatDateStr(date);
              const isToday = dateStr === todayStr;
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();

              return (
                <div 
                  key={dateStr}
                  className={`p-3 text-center ${isToday ? 'bg-violet-950/30' : ''}`}
                >
                  <span className="text-[11px] font-medium text-slate-400 block">{dayName}</span>
                  <span className={`text-base font-bold inline-block px-2 py-0.5 rounded-full mt-0.5 ${
                    isToday ? 'bg-violet-600 text-white' : 'text-slate-200'
                  }`}>
                    {dayNumber}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-800/80 min-h-[500px]">
            {weekDays.map(date => {
              const dateStr = formatDateStr(date);
              const sessions = getSessionsForDate(dateStr);
              const dayExams = getExamsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`p-2 space-y-2 transition-colors ${
                    isToday ? 'bg-violet-950/10' : 'hover:bg-slate-800/20'
                  }`}
                >
                  {/* Exams */}
                  {dayExams.map(exam => (
                    <div
                      key={exam.id}
                      className="p-2 rounded-xl bg-rose-600/90 text-white text-xs font-bold shadow-xs border border-rose-500/50"
                    >
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="truncate">{exam.name}</span>
                      </div>
                      <span className="text-[10px] text-rose-200 block mt-0.5">{exam.exam_time || 'Exam Day'}</span>
                    </div>
                  ))}

                  {/* Sessions */}
                  {sessions.map(session => {
                    const subject = subjects.find(s => s.id === session.subject_id);
                    const isCompleted = session.status === 'Completed';
                    const isMissed = session.status === 'Missed';

                    return (
                      <div
                        key={session.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, session)}
                        onClick={() => setSelectedSession(session)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-950/40 border-emerald-700/60 opacity-75'
                            : isMissed
                            ? 'bg-rose-950/40 border-rose-700/60'
                            : 'bg-[#0B1020] border-slate-700 hover:border-violet-500'
                        }`}
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: subject?.color || '#7C3AED'
                        }}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{session.start_time} - {session.end_time}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isCompleted ? 'bg-emerald-900/60 text-emerald-300' : isMissed ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {session.duration_minutes}m
                          </span>
                        </div>
                        <h6 className={`text-xs font-bold mt-1 text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {session.title}
                        </h6>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{subject?.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-[#111728] rounded-2xl border border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-400">
                Hourly agenda of scheduled focus blocks and milestones
              </p>
            </div>
            <span className="text-xs font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
              {getSessionsForDate(formatDateStr(currentDate)).length} Sessions Scheduled
            </span>
          </div>

          {/* Exams on this day */}
          {getExamsForDate(formatDateStr(currentDate)).map(exam => (
            <div key={exam.id} className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{exam.name}</h4>
                  <span className="text-xs text-rose-300">Milestone Exam • Weight: {exam.weightage_percentage || 30}%</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-300 bg-rose-900/60 px-3 py-1 rounded-full border border-rose-700/60">
                {exam.exam_time || '09:00 AM'}
              </span>
            </div>
          ))}

          {/* Sessions timeline */}
          <div className="space-y-3">
            {getSessionsForDate(formatDateStr(currentDate)).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No study sessions scheduled for this day. Click &ldquo;Schedule Session&rdquo; or use the AI Study Planner.
              </div>
            ) : (
              getSessionsForDate(formatDateStr(currentDate)).map(session => {
                const subject = subjects.find(s => s.id === session.subject_id);
                const isCompleted = session.status === 'Completed';
                const isMissed = session.status === 'Missed';

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-800/50'
                        : isMissed
                        ? 'bg-rose-950/30 border-rose-800/50'
                        : 'bg-[#0B1020] border-slate-700 hover:border-violet-500'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: subject?.color || '#7C3AED' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className={`text-sm font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {session.title}
                          </h5>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted ? 'bg-emerald-900/60 text-emerald-300' : isMissed ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{session.notes || 'No notes added.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200 block">
                          {session.start_time} – {session.end_time}
                        </span>
                        <span className="text-[11px] text-slate-400">{session.duration_minutes} mins</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isCompleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSessionCompleted(session.id);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        )}
                        {!isCompleted && !isMissed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSessionMissed(session.id);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Missed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SESSION DETAIL MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#111728] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: subjects.find(s => s.id === selectedSession.subject_id)?.color || '#7C3AED' }}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedSession.status === 'Completed'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                      : selectedSession.status === 'Missed'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                      : 'bg-violet-950/80 text-violet-300 border border-violet-700/60'
                  }`}>
                    {selectedSession.status}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedSession.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Subject: {subjects.find(s => s.id === selectedSession.subject_id)?.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date</span>
                <strong className="text-white font-bold">{selectedSession.session_date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Time</span>
                <strong className="text-white font-bold">{selectedSession.start_time} – {selectedSession.end_time}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Duration</span>
                <strong className="text-white font-bold">{selectedSession.duration_minutes} Minutes</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Type</span>
                <strong className="text-white font-bold">
                  {selectedSession.is_revision ? 'Pre-Exam Revision' : 'Core Study Block'}
                </strong>
              </div>
            </div>

            {selectedSession.notes && (
              <div className="text-xs text-slate-300 bg-[#0B1020] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium block mb-1">Session Notes:</span>
                {selectedSession.notes}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={async () => {
                  await deleteStudySession(selectedSession.id);
                  setSelectedSession(null);
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedSession.status !== 'Completed' && (
                  <button
                    onClick={async () => {
                      await markSessionCompleted(selectedSession.id);
                      setSelectedSession(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {selectedSession.status !== 'Missed' && selectedSession.status !== 'Completed' && (
                  <button
                    onClick={async () => {
                      await markSessionMissed(selectedSession.id);
                      setSelectedSession(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Mark Missed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE NEW SESSION MODAL */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#111728] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Schedule Study Session</h3>
                <p className="text-xs text-slate-400">Add a focus block directly to your academic calendar</p>
              </div>
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Subject</label>
                <select
                  value={newSessionForm.subject_id}
                  onChange={e => setNewSessionForm({ ...newSessionForm, subject_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#111728] text-white">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Session Title / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms & Dijkstra's Algorithm"
                  value={newSessionForm.title}
                  onChange={e => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={newSessionForm.session_date}
                    onChange={e => setNewSessionForm({ ...newSessionForm, session_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSessionForm.start_time}
                    onChange={e => setNewSessionForm({ ...newSessionForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Duration (Minutes)</label>
                <select
                  value={newSessionForm.duration_minutes}
                  onChange={e => setNewSessionForm({ ...newSessionForm, duration_minutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white focus:outline-none focus:border-violet-500"
                >
                  <option value={45} className="bg-[#111728] text-white">45 Minutes</option>
                  <option value={60} className="bg-[#111728] text-white">60 Minutes (1 Hour)</option>
                  <option value={75} className="bg-[#111728] text-white">75 Minutes (1h 15m)</option>
                  <option value={90} className="bg-[#111728] text-white">90 Minutes (1h 30m)</option>
                  <option value={120} className="bg-[#111728] text-white">120 Minutes (2 Hours)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes / Target</label>
                <textarea
                  placeholder="Target problems, textbook chapters, or formulas to cover..."
                  value={newSessionForm.notes}
                  onChange={e => setNewSessionForm({ ...newSessionForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-[#0B1020] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
