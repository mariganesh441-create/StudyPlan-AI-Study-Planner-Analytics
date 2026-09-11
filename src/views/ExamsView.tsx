import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Target, 
  AlertTriangle, 
  Edit3, 
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Exam } from '../types';
import { ExamModal } from '../components/exams/ExamModal';

export const ExamsView: React.FC = () => {
  const { exams, subjects, getSubjectProgress, deleteExam } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

  const calculateDaysLeft = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

  const handleEdit = (exam: Exam) => {
    setExamToEdit(exam);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setExamToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white glow-title">Exams & Assessment Deadlines</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time countdowns, target scores, and syllabus readiness alignment
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* Featured Exam Spotlight (Prompt Highlight: "DSA Exam – 5 Days Left") */}
      {sortedExams.length > 0 && (
        <div className="bg-gradient-to-r from-[#2D122D] via-[#1E1435] to-[#111728] rounded-2xl p-6 text-white border border-[#F472B6]/40 shadow-lg shadow-[#F472B6]/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F472B6]/20 border border-[#F472B6]/30 text-[#F472B6] text-xs font-black uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Next High Priority Assessment</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white glow-title">
              {sortedExams[0].name} – {calculateDaysLeft(sortedExams[0].exam_date) <= 0 ? 'Today!' : `${calculateDaysLeft(sortedExams[0].exam_date)} Days Left`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Exam Date: {new Date(sortedExams[0].exam_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {sortedExams[0].exam_time || '10:00 AM'}.
              {sortedExams[0].location && ` Venue: ${sortedExams[0].location}.`}
            </p>
          </div>

          <div className="bg-[#111728]/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 text-center shrink-0 min-w-40">
            <span className="text-[11px] font-bold text-[#2DD4BF] block uppercase">Target Score</span>
            <span className="text-3xl font-black text-white">{sortedExams[0].target_score || 90}%</span>
            <span className="text-[11px] text-slate-400 block mt-1">Syllabus: {sortedExams[0].syllabus_coverage_percentage}%</span>
          </div>
        </div>
      )}

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedExams.map((exam) => {
          const daysLeft = calculateDaysLeft(exam.exam_date);
          const isUrgent = daysLeft <= 7;
          const subject = subjects.find(s => s.id === exam.subject_id);
          const subjectProgress = subject ? getSubjectProgress(subject.id) : 0;

          return (
            <div
              key={exam.id}
              className={`bg-[#111728] rounded-2xl border p-5 sm:p-6 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between ${
                isUrgent ? 'border-[#F472B6]/50 shadow-[#F472B6]/5' : 'border-slate-800/80'
              }`}
            >
              <div>
                {/* Header with subject badge and edit */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject?.color || '#7C3AED' }} 
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {subject?.name || 'Academic Subject'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete exam "${exam.name}"?`)) deleteExam(exam.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#F472B6] hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exam Title & Countdown */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-black text-white leading-snug">
                    {exam.name}
                  </h3>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap shadow-sm ${
                    isUrgent 
                      ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40 glow-badge-pink' 
                      : 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/40'
                  }`}>
                    {daysLeft <= 0 ? 'Exam Today!' : `${daysLeft} Days Left`}
                  </div>
                </div>

                {/* Exam Metadata */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ({exam.exam_time || 'Morning'})</span>
                  </div>
                  {exam.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.location}</span>
                    </div>
                  )}
                  {exam.notes && (
                    <p className="text-[11px] text-slate-300 italic mt-1 bg-[#141C32] p-2 rounded-lg border border-slate-800/80">
                      "{exam.notes}"
                    </p>
                  )}
                </div>

                {/* Readiness & Target Progress Comparison */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Your Syllabus Readiness</span>
                      <span className="font-extrabold text-white">{subjectProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#18223C] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${subjectProgress}%`, backgroundColor: subject?.color || '#7C3AED' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Syllabus Coverage: <strong className="text-white">{exam.syllabus_coverage_percentage}%</strong></span>
                    <span>Target Score: <strong className="text-[#2DD4BF] font-bold">{exam.target_score || 90}%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examToEdit={examToEdit}
      />
    </div>
  );
};
