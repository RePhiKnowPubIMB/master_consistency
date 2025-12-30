import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

const DayDetailsModal = ({ day, onClose }) => {
    if (!day) return null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{formatDate(day.date)}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${day.isSubmitted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {day.isSubmitted ? 'Submitted' : 'In Progress'}
                            </span>
                            <span className="text-slate-400 text-sm">Score: {day.consistencyScore}%</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Comment Section */}
                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Day Reflection</h3>
                        {day.comment ? (
                            <p className="text-slate-200 italic">"{day.comment}"</p>
                        ) : (
                            <p className="text-slate-500 italic">No reflection recorded for this day.</p>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Codeforces */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-emerald-400 font-medium mb-2">Codeforces</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Solved</span>
                                <span className="text-white font-bold">{day.codeforces?.solvedCount || 0}</span>
                            </div>
                        </div>

                        {/* Revision */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-blue-400 font-medium mb-2">Revision</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Problems</span>
                                <span className="text-white font-bold">{day.revision?.problems?.filter(p => p.status === 'SOLVED').length || 0} / {day.revision?.totalDue || day.revision?.problems?.length || 0}</span>
                            </div>
                        </div>

                        {/* Academic */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-purple-400 font-medium mb-2">Academic</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Hours</span>
                                <span className="text-white font-bold">{day.academic?.hoursDone || 0} / {day.academic?.hoursTarget || 0}</span>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {day.academic?.todoList?.map((task, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                                        {task.isDone ? <CheckCircle size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-600" />}
                                        <span className={task.isDone ? 'line-through' : ''}>{task.task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kaggle */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-orange-400 font-medium mb-2">Kaggle</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Minutes</span>
                                <span className="text-white font-bold">{day.kaggle?.minutesDone || 0} / {day.kaggle?.targetMinutes || 0}</span>
                            </div>
                             <ul className="mt-2 space-y-1">
                                {day.kaggle?.todoList?.map((task, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                                        {task.isDone ? <CheckCircle size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-600" />}
                                        <span className={task.isDone ? 'line-through' : ''}>{task.task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Prayers */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-teal-400 font-medium mb-2">Prayers</h3>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Count</span>
                                <span className="text-white font-bold">{day.prayers?.count || 0} / 5</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => (
                                    <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${day.prayers?.[p] ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-700 text-slate-500'}`}>
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Workout */}
                        <div className="bg-slate-700/20 p-4 rounded-lg">
                            <h3 className="text-red-400 font-medium mb-2">Workout</h3>
                            {day.isRestDay ? (
                                <div className="text-sm text-slate-400 italic">Rest Day 🛌</div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Status</span>
                                        <span className={day.workout?.isCompleted ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                            {day.workout?.isCompleted ? 'Completed' : 'Incomplete'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {Object.entries(day.workout?.checklist || {}).map(([ex, done]) => (
                                            <div key={ex} className="flex items-center gap-1.5">
                                                {done ? <CheckCircle size={10} className="text-emerald-500" /> : <XCircle size={10} className="text-slate-600" />}
                                                <span className={`text-[10px] uppercase ${done ? 'text-slate-300' : 'text-slate-500'}`}>{ex}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayDetailsModal;
