import { useState } from 'react';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

const ProblemForm = ({ onAddProblem, onPopProblem, problemCount }) => {
  const [problemLink, setProblemLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!problemLink.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onAddProblem(problemLink.trim());
    
    if (success) {
      setProblemLink('');
    }
    
    setIsSubmitting(false);
  };

  const handlePop = async () => {
    setIsSubmitting(true);
    await onPopProblem();
    setIsSubmitting(false);
  };

  return (
    <div className="card mb-8 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="problemLink" 
            className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
          >
            <LinkIcon size={18} />
            Codeforces Problem Link
          </label>
          <input
            type="url"
            id="problemLink"
            value={problemLink}
            onChange={(e) => setProblemLink(e.target.value)}
            placeholder="https://codeforces.com/problemset/problem/1234/A"
            className="input-field"
            disabled={isSubmitting}
            required
          />
          <p className="mt-2 text-xs text-slate-500">
            Example: https://codeforces.com/problemset/problem/1234/A or https://codeforces.com/contest/1234/problem/A
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !problemLink.trim()}
            className="btn-primary flex items-center justify-center gap-2 flex-1"
          >
            <Plus size={20} />
            {isSubmitting ? 'Adding...' : 'Add Problem'}
          </button>
          
          <button
            type="button"
            onClick={handlePop}
            disabled={isSubmitting || problemCount === 0}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <Trash2 size={20} />
            Pop Next Problem
          </button>
        </div>

        {problemCount > 0 && (
          <div className="text-center">
            <p className="text-sm text-slate-600 bg-blue-50 py-2 px-4 rounded-lg inline-block">
              📚 <span className="font-semibold">{problemCount}</span> problem{problemCount !== 1 ? 's' : ''} in queue
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProblemForm;
