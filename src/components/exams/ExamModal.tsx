import React, { useState, useEffect } from 'react';
import { GraduationCap, Trash2 } from 'lucide-react';
import { Exam } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: Exam | null;
  defaultSubjectId?: string;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
  defaultSubjectId,
}) => {
  const { subjects, addExam, updateExam, deleteExam } = useApp();

  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [coveragePercentage, setCoveragePercentage] = useState(100);
  const [targetScore, setTargetScore] = useState(90);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (examToEdit) {
      setSubjectId(examToEdit.subject_id);
      setName(examToEdit.name);
      setExamDate(examToEdit.exam_date);
      setExamTime(examToEdit.exam_time || '10:00 AM');
      setLocation(examToEdit.location || '');
      setCoveragePercentage(examToEdit.syllabus_coverage_percentage);
      setTargetScore(examToEdit.target_score || 90);
      setNotes(examToEdit.notes || '');
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setName('');
      // Default to 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setExamDate(d.toISOString().split('T')[0]);
      setExamTime('10:00 AM');
      setLocation('Main Exam Hall');
      setCoveragePercentage(100);
      setTargetScore(90);
      setNotes('');
    }
  }, [examToEdit, defaultSubjectId, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectId || !examDate) return;

    setIsSubmitting(true);
    try {
      if (examToEdit) {
        await updateExam(examToEdit.id, {
          subject_id: subjectId,
          name: name.trim(),
          exam_date: examDate,
          exam_time: examTime,
          location,
          syllabus_coverage_percentage: Number(coveragePercentage),
          target_score: Number(targetScore),
          notes,
        });
      } else {
        await addExam({
          subject_id: subjectId,
          name: name.trim(),
          exam_date: examDate,
          exam_time: examTime,
          location,
          syllabus_coverage_percentage: Number(coveragePercentage),
          target_score: Number(targetScore),
          notes,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!examToEdit) return;
    if (confirm(`Delete exam "${examToEdit.name}"?`)) {
      await deleteExam(examToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111728] w-full max-w-md rounded-2xl shadow-xl border border-slate-800/90 overflow-hidden animate-in fade-in zoom-in-95 text-white">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {examToEdit ? 'Edit Exam Milestone' : 'Schedule New Exam'}
              </h3>
              <p className="text-xs text-slate-400">Calculates countdown and prioritized study blocks</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                const sub = subjects.find(s => s.id === e.target.value);
                if (sub && !name) {
                  setName(`${sub.name} Mid-Term Exam`);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DSA Mid-Term Exam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Time</label>
              <input
                type="text"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Syllabus Coverage</label>
                <span className="text-xs font-bold text-[#2DD4BF]">{coveragePercentage}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={coveragePercentage}
                onChange={(e) => setCoveragePercentage(parseInt(e.target.value))}
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Score (%)</label>
              <input
                type="number"
                min="35"
                max="100"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 85)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Classroom</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hall 302, Academic Block A"
              className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {examToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#F472B6] hover:bg-[#F472B6]/15 flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-[#F472B6]/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-colors cursor-pointer"
              >
                {examToEdit ? 'Save Exam' : 'Schedule Exam'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
