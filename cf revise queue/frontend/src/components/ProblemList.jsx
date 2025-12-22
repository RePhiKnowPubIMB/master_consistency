import { ExternalLink, Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDate, isToday, getDaysUntil } from '../utils/dateUtils';

const ProblemList = ({ problems, loading, refreshing, onRefresh, onDeleteProblem }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <AlertCircle size={40} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Problems Yet</h3>
          <p className="text-slate-600 mb-4 max-w-md">
            Start adding Codeforces problems after watching their editorials. 
            We'll remind you to revise them in 7 days!
          </p>
          <div className="text-sm text-slate-500">
            💡 Tip: Consistent revision is the key to mastering competitive programming
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Clock size={28} className="text-indigo-600" />
          Revision Queue
        </h2>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          title="Refresh"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Problem Link</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Watched Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Revise Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => {
              const reviseToday = isToday(problem.reviseDate);
              const daysUntil = getDaysUntil(problem.reviseDate);
              
              return (
                <tr 
                  key={problem._id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    reviseToday ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <a
                      href={problem.problemLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 hover:underline"
                    >
                      <ExternalLink size={16} />
                      {problem.problemLink.length > 50 
                        ? problem.problemLink.substring(0, 50) + '...' 
                        : problem.problemLink}
                    </a>
                    {index === 0 && (
                      <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                        NEXT UP
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {formatDate(problem.dateWatchedEditorial)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={reviseToday ? 'text-yellow-600' : 'text-slate-600'} />
                      <span className={reviseToday ? 'font-bold text-yellow-600' : 'text-slate-600'}>
                        {formatDate(problem.reviseDate)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {reviseToday ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        ⏰ Revise Today!
                      </span>
                    ) : daysUntil < 0 ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        🔴 Overdue ({Math.abs(daysUntil)}d ago)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        📅 In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {problems.map((problem, index) => {
          const reviseToday = isToday(problem.reviseDate);
          const daysUntil = getDaysUntil(problem.reviseDate);
          
          return (
            <div 
              key={problem._id} 
              className={`border rounded-lg p-4 ${
                reviseToday ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-white'
              }`}
            >
              {index === 0 && (
                <span className="inline-block mb-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                  NEXT UP
                </span>
              )}
              
              <a
                href={problem.problemLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 hover:underline mb-3 break-all"
              >
                <ExternalLink size={16} className="flex-shrink-0" />
                <span className="break-all">{problem.problemLink}</span>
              </a>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} />
                  <span className="font-medium">Watched:</span>
                  <span>{formatDate(problem.dateWatchedEditorial)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock size={16} className={reviseToday ? 'text-yellow-600' : 'text-slate-600'} />
                  <span className="font-medium">Revise:</span>
                  <span className={reviseToday ? 'font-bold text-yellow-600' : 'text-slate-600'}>
                    {formatDate(problem.reviseDate)}
                  </span>
                </div>

                <div className="pt-2">
                  {reviseToday ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ⏰ Revise Today!
                    </span>
                  ) : daysUntil < 0 ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      🔴 Overdue ({Math.abs(daysUntil)}d ago)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      📅 In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProblemList;
