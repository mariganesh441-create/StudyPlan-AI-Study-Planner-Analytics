import React, { useState, useEffect } from 'react';
import { Target, Trash2 } from 'lucide-react';
import { Goal } from '../../types';
import { useApp } from '../../context/AppContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { subjects, addGoal, updateGoal, deleteGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [progress, setProgress] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<Goal['category']>('Subject Mastery');
  const [subjectId, setSubjectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetMetric(goalToEdit.target_metric);
      setProgress(goalToEdit.current_progress_percentage);
      setDeadline(goalToEdit.deadline);
      setCategory(goalToEdit.category);
      setSubjectId(goalToEdit.subject_id || '');
    } else {
      setTitle('');
      setDescription('');
      setTargetMetric('Complete 100% syllabus topics');
      setProgress(0);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDeadline(d.toISOString().split('T')[0]);
      setCategory('Subject Mastery');
      setSubjectId(subjects[0]?.id || '');
    }
  }, [goalToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    setIsSubmitting(true);
    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          title: title.trim(),
          description,
          target_metric: targetMetric,
          current_progress_percentage: Number(progress),
          deadline,
          category,
          subject_id: subjectId || undefined,
          is_completed: Number(progress) >= 100,
        });
      } else {
        await addGoal({
          title: title.trim(),
          description,
          target_metric: targetMetric,
          current_progress_percentage: Number(progress),
          deadline,
          category,
          subject_id: subjectId || undefined,
          is_completed: Number(progress) >= 100,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goalToEdit) return;
    if (confirm(`Delete goal "${goalToEdit.title}"?`)) {
      await deleteGoal(goalToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111728] w-full max-w-md rounded-2xl shadow-xl border border-slate-800/90 overflow-hidden animate-in fade-in zoom-in-95 text-white">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {goalToEdit ? 'Edit Milestone Goal' : 'Create Study Goal'}
              </h3>
              <p className="text-xs text-slate-400">Track deadlines, target metrics & completion</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete DSA before September 20"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Goal['category'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              >
                <option value="Subject Mastery">Subject Mastery</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Daily Habit">Daily Habit</option>
                <option value="Project">Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Metric / Criteria</label>
            <input
              type="text"
              required
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              placeholder="e.g. Solve 50 medium questions & finish tree traversal"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Current Progress</label>
              <span className="text-xs font-bold text-[#2DD4BF]">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full accent-[#7C3AED] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Linked Subject (Optional)</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            >
              <option value="">None / General</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {goalToEdit ? (
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
                {goalToEdit ? 'Save Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
