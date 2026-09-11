import React, { useState, useEffect } from 'react';
import { ListTree, Trash2 } from 'lucide-react';
import { Topic, DifficultyLevel, TopicStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: Topic | null;
  defaultSubjectId?: string;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  topicToEdit,
  defaultSubjectId,
}) => {
  const { subjects, addTopic, updateTopic, deleteTopic, topics } = useApp();

  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<TopicStatus>('Pending');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [durationHours, setDurationHours] = useState(2);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topicToEdit) {
      setSubjectId(topicToEdit.subject_id);
      setName(topicToEdit.name);
      setStatus(topicToEdit.status);
      setDifficulty(topicToEdit.difficulty);
      setDurationHours(topicToEdit.estimated_duration_hours);
      setOrderIndex(topicToEdit.order_index);
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setName('');
      setStatus('Pending');
      setDifficulty('Medium');
      setDurationHours(2.5);
      const existingInSubject = topics.filter(t => t.subject_id === (defaultSubjectId || subjects[0]?.id));
      setOrderIndex(existingInSubject.length + 1);
    }
  }, [topicToEdit, defaultSubjectId, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectId) return;

    setIsSubmitting(true);
    try {
      if (topicToEdit) {
        await updateTopic(topicToEdit.id, {
          subject_id: subjectId,
          name: name.trim(),
          status,
          difficulty,
          estimated_duration_hours: Number(durationHours),
          order_index: Number(orderIndex),
          completed_at: status === 'Completed' ? new Date().toISOString() : undefined,
        });
      } else {
        await addTopic({
          subject_id: subjectId,
          name: name.trim(),
          status,
          difficulty,
          estimated_duration_hours: Number(durationHours),
          order_index: Number(orderIndex),
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!topicToEdit) return;
    if (confirm(`Delete topic "${topicToEdit.name}"?`)) {
      await deleteTopic(topicToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111728] w-full max-w-md rounded-2xl shadow-xl border border-slate-800/90 overflow-hidden animate-in fade-in zoom-in-95 text-white">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30">
              <ListTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {topicToEdit ? 'Edit Syllabus Topic' : 'Add Topic to Syllabus'}
              </h3>
              <p className="text-xs text-slate-400">Affects automatic subject completion percentage</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dynamic Programming (Knapsack & Subsequences)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TopicStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sequence Order</label>
              <input
                type="number"
                min="1"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {topicToEdit ? (
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
                {topicToEdit ? 'Save Topic' : 'Add Topic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
