import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, AlertCircle, Check, X, Edit2, Sparkles } from 'lucide-react';

export const RescheduleBanner: React.FC = () => {
  const { 
    activeRescheduleProposal, 
    acceptRescheduleProposal, 
    discardRescheduleProposal, 
    subjects 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  if (!activeRescheduleProposal) return null;

  const { original_session, suggested_session, reason, id } = activeRescheduleProposal;
  const subject = subjects.find(s => s.id === original_session.subject_id);

  const handleStartEdit = () => {
    setCustomDate(suggested_session.session_date);
    setCustomTime(suggested_session.start_time);
    setIsEditing(true);
  };

  const handleSaveCustom = async () => {
    // calculate new end time
    const [h, m] = (customTime || '18:00').split(':').map(Number);
    const dur = suggested_session.planned_duration_minutes || 60;
    const endMinutes = h * 60 + m + dur;
    const endHH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endMM = String(endMinutes % 60).padStart(2, '0');

    await acceptRescheduleProposal(id);
    setIsEditing(false);
  };

  return (
    <div 
      id="auto-reschedule-banner"
      className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-2xl z-50 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-indigo-500/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Session Missed
              </span>
              <span className="text-xs font-medium text-slate-400">
                AI Automatic Rescheduling
              </span>
            </div>
            <h4 className="text-base font-semibold text-white mt-1">
              Move &ldquo;{subject?.name || 'Study'} – {original_session.title.split('–')[1] || original_session.title}&rdquo;?
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Original slot was missed on <strong className="text-slate-100">{original_session.session_date}</strong>. 
              StudyPlan AI found the next optimal open slot before upcoming exam deadlines:
            </p>
          </div>
        </div>

        <button
          onClick={() => discardRescheduleProposal(id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss proposal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isEditing ? (
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-indigo-200 bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-800/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{suggested_session.session_date}</span>
            </div>
            <span className="text-indigo-600">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{suggested_session.start_time} - {suggested_session.end_time}</span>
            </div>
            <span className="text-indigo-600">•</span>
            <span>{suggested_session.duration_minutes} mins</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartEdit}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/60"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            <button
              onClick={() => acceptRescheduleProposal(id)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept New Slot</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-xs font-medium text-slate-300 mb-2">Pick a preferred day & time:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Session Date</label>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
              <input
                type="time"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustom}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
            >
              Confirm Custom Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
