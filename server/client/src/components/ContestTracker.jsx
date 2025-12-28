import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Clock, Trophy, AlertCircle, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const ContestTracker = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/contests');
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching contest data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!data || !data.upcoming || data.upcoming.length === 0) return;

        const timer = setInterval(() => {
            const nextContest = data.upcoming[0];
            const now = new Date();
            const start = new Date(nextContest.startTimeSeconds * 1000);
            
            if (start > now) {
                setTimeLeft(formatDistanceToNow(start, { addSuffix: true }));
            } else {
                setTimeLeft('Started');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [data]);

    if (loading) return <div className="text-slate-400 text-center py-8">Loading Contest Data...</div>;

    const nextContest = data?.upcoming?.[0];

    return (
        <div className="space-y-8">
            {/* 1. Upcoming Contests Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <Calendar className="text-blue-400" />
                        Upcoming Contests
                    </h2>
                    {nextContest && (
                        <span className="text-sm font-mono bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">
                            Next: {timeLeft}
                        </span>
                    )}
                </div>
                
                <div className="p-6">
                    {data?.upcoming?.length > 0 ? (
                        <div className="space-y-4">
                            {/* Featured Next Contest */}
                            <div className="bg-white text-slate-900 rounded-lg p-6 shadow-lg border-l-8 border-blue-600 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Trophy size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-sm mb-2">
                                        <AlertCircle size={16} />
                                        Pay Attention
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{nextContest.name}</h3>
                                    <div className="flex items-center gap-6 text-slate-700 font-medium">
                                        <span>{format(new Date(nextContest.startTimeSeconds * 1000), 'PP p')}</span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                                            {formatDistanceToNow(new Date(nextContest.startTimeSeconds * 1000))}
                                        </span>
                                    </div>
                                    <a 
                                        href="https://codeforces.com/contests" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                                    >
                                        Register now »
                                    </a>
                                </div>
                            </div>

                            {/* Other Upcoming */}
                            {data.upcoming.slice(1).map(contest => (
                                <div key={contest.id} className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
                                    <div>
                                        <div className="font-semibold text-slate-200">{contest.name}</div>
                                        <div className="text-sm text-slate-400">{format(new Date(contest.startTimeSeconds * 1000), 'PP p')}</div>
                                    </div>
                                    <a 
                                        href={`https://codeforces.com/contest/${contest.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-8">
                            No upcoming relevant contests found.
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Contest Heatmap Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2 mb-1">
                            <Trophy className="text-yellow-500" />
                            Contest Participation
                        </h2>
                        <p className="text-sm text-slate-400">Tracking Div 2, Div 3, Div 4 & Educational Rounds</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                {data?.stats?.participatedSince2024} <span className="text-sm text-slate-500">/ {data?.stats?.totalContestsSince2024}</span>
                            </div>
                            <div className="text-slate-500 text-xs uppercase">Since 2024</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{data?.stats?.maxStreak || 0}</div>
                            <div className="text-slate-500 text-xs uppercase">Max Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{data?.stats?.maxStreakLastYear || 0}</div>
                            <div className="text-slate-500 text-xs uppercase">Last Year</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{data?.stats?.maxStreakLastMonth || 0}</div>
                            <div className="text-slate-500 text-xs uppercase">Last Month</div>
                        </div>
                    </div>
                </div>

                {/* The Grid */}
                <div className="flex flex-wrap gap-1.5 justify-start">
                    {data?.heatmap?.map((contest) => (
                        <div 
                            key={contest.id}
                            className={`w-4 h-4 rounded-sm transition-all relative group cursor-pointer ${
                                contest.participated 
                                    ? 'bg-green-500 hover:bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]' 
                                    : 'bg-slate-700/50 hover:bg-slate-600'
                            }`}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-xs p-3 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                                <div className="font-bold text-slate-200 mb-1">{contest.name}</div>
                                <div className="text-slate-400 mb-2">{format(new Date(contest.startTimeSeconds * 1000), 'PP')}</div>
                                <div className={`flex items-center gap-1 font-bold ${contest.participated ? 'text-green-400' : 'text-red-400'}`}>
                                    {contest.participated ? (
                                        <><CheckCircle size={12} /> Participated</>
                                    ) : (
                                        <><XCircle size={12} /> Missed</>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-slate-700/50"></div>
                        <span>Missed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                        <span>Participated</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestTracker;
