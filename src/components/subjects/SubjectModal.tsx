import React, { useState, useEffect } from 'react';
import { BookOpen, Check, Trash2, Calendar, Target, Clock, ShieldAlert } from 'lucide-react';
import { Subject, DifficultyLevel } from '../../types';
import { useApp } from '../../context/AppContext';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectToEdit,
}) => {
  const { addSubject, updateSubject, deleteSubject } = useApp();

  const [name, setName] = useState('');
  const [currentKnowledge, setCurrentKnowledge] = useState(50);
  const [targetPercentage, setTargetPercentage] = useState(90);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [examDate, setExamDate] = useState('');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(4);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCurrentKnowledge(subjectToEdit.current_knowledge_percentage);
      setTargetPercentage(subjectToEdit.target_percentage);
      setDifficulty(subjectToEdit.difficulty);
      setExamDate(subjectToEdit.exam_date || '');
      setWeeklyTargetHours(subjectToEdit.weekly_study_target_hours);
      setColor(subjectToEdit.color);
      setNotes(subjectToEdit.notes || '');
    } else {
      setName('');
      setCurrentKnowledge(50);
      setTargetPercentage(90);
      setDifficulty('Medium');
      setExamDate('');
      setWeeklyTargetHours(4);
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setNotes('');
    }
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (subjectToEdit) {
        await updateSubject(subjectToEdit.id, {
          name: name.trim(),
          current_knowledge_percentage: Number(currentKnowledge),
          target_percentage: Number(targetPercentage),
          difficulty,
          exam_date: examDate || undefined,
          weekly_study_target_hours: Number(weeklyTargetHours),
          color,
          notes,
        });
      } else {
        await addSubject({
          name: name.trim(),
          current_knowledge_percentage: Number(currentKnowledge),
          target_percentage: Number(targetPercentage),
          difficulty,
          exam_date: examDate || undefined,
          weekly_study_target_hours: Number(weeklyTargetHours),
          color,
          notes,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToEdit) return;
    if (confirm(`Are you sure you want to delete "${subjectToEdit.name}" and its syllabus topics?`)) {
      await deleteSubject(subjectToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111728] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800/90 overflow-hidden my-6 animate-in fade-in zoom-in-95 text-white">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between" style={{ borderTop: `4px solid ${color}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: color }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {subjectToEdit ? `Edit Subject: ${subjectToEdit.name}` : 'Add New Subject'}
              </h3>
              <p className="text-xs text-slate-400">Configure academic goals, targets, and exam deadline</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms (DSA)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upcoming Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          {/* Current Knowledge & Target Percentage */}
          <div className="p-4 rounded-xl bg-[#141C32] border border-slate-800/80 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-300">Current Knowledge Level</span>
                <span className="text-xs font-bold text-white">{currentKnowledge}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentKnowledge}
                onChange={(e) => setCurrentKnowledge(parseInt(e.target.value))}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-300">Target Score / Mastery</span>
                <span className="text-xs font-bold text-[#2DD4BF]">{targetPercentage}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>

          {/* Weekly study target & color picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Study Target</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={weeklyTargetHours}
                  onChange={(e) => setWeeklyTargetHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white text-xs font-medium"
                />
                <span className="text-xs text-slate-400">hrs/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Theme Color</label>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: c, transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Key Focus Area</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on graph algorithms and dynamic programming state transitions."
              className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {subjectToEdit ? (
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
                {subjectToEdit ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
