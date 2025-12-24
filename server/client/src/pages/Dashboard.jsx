import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import EfficiencyHeatmap from '../components/EfficiencyHeatmap';
import DayDetailsModal from '../components/DayDetailsModal';
import BadgeList from '../components/BadgeList';
import { ExternalLink, Calendar, Clock, Send, CheckCircle, Award } from 'lucide-react';
import { formatDate, isToday, getDaysUntil } from '../utils/dateUtils';

const Dashboard = () => {
    const [dailyLog, setDailyLog] = useState(null);
    const [history, setHistory] = useState([]);
    const [reviseQueue, setReviseQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAcademicTask, setNewAcademicTask] = useState('');
    const [newReviseProblem, setNewReviseProblem] = useState('');

    const [tomorrowAcademicTasks, setTomorrowAcademicTasks] = useState([]);
    const [tomorrowKaggleTasks, setTomorrowKaggleTasks] = useState([]);
    const [newTomorrowAcademicTask, setNewTomorrowAcademicTask] = useState('');
    const [newTomorrowKaggleTask, setNewTomorrowKaggleTask] = useState('');

    const [comment, setComment] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);
    const [quote, setQuote] = useState(null);
    const [badges, setBadges] = useState([]);
    const [newBadgeAlert, setNewBadgeAlert] = useState(null);

    const fetchData = async () => {
        try {
            const [todayRes, historyRes, reviseRes, tomorrowRes, quoteRes, badgesRes] = await Promise.all([
                api.get('/dashboard/today'),
                api.get('/dashboard/history'),
                api.get('/revise'),
                api.get('/dashboard/tomorrow-tasks'),
                api.get('/dashboard/quote'),
                api.get('/dashboard/badges')
            ]);
            setDailyLog(todayRes.data);
            setHistory(historyRes.data);
            setReviseQueue(reviseRes.data.data || []);
            setTomorrowAcademicTasks(tomorrowRes.data.academic || []);
            setTomorrowKaggleTasks(tomorrowRes.data.kaggle || []);
            setQuote(quoteRes.data);
            setBadges(badgesRes.data || []);
            
            if (todayRes.data.comment) {
                setComment(todayRes.data.comment);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitDay = async () => {
        if (!window.confirm("Are you sure you want to submit today's progress? This will finalize your stats for the day.")) return;
        
        try {
            const res = await api.post('/dashboard/submit-day', { comment });
            setDailyLog(res.data.log);
            
            // Check for new badges
            if (res.data.newBadges && res.data.newBadges.length > 0) {
                setNewBadgeAlert(res.data.newBadges);
                setBadges(prev => [...prev, ...res.data.newBadges]);
            }

            // Refresh history to show the new submission on heatmap
            const historyRes = await api.get('/dashboard/history');
            setHistory(historyRes.data);
            alert("Day submitted successfully!");
        } catch (error) {
            console.error("Error submitting day:", error);
            alert("Failed to submit day.");
        }
    };

    const handleDayClick = (value) => {
        if (!value || !value.date) return;
        // Find the full log for this day from history
        const dayLog = history.find(h => new Date(h.date).toDateString() === new Date(value.date).toDateString());
        if (dayLog) {
            setSelectedDay(dayLog);
        }
    };

    const handleAddTomorrowTask = async (type) => {
        if (dailyLog.isSubmitted) return;
        const task = type === 'academic' ? newTomorrowAcademicTask : newTomorrowKaggleTask;
        if (!task.trim()) return;

        try {
            const res = await api.post('/dashboard/tomorrow-task', { type, task });
            if (type === 'academic') {
                setTomorrowAcademicTasks(res.data.tasks);
                setNewTomorrowAcademicTask('');
            } else {
                setTomorrowKaggleTasks(res.data.tasks);
                setNewTomorrowKaggleTask('');
            }
        } catch (error) {
            console.error("Error adding tomorrow task:", error);
        }
    };

    const handleRefreshStatus = async () => {
        if (dailyLog.isSubmitted) return;
        try {
            const res = await api.post('/dashboard/refresh-status');
            setDailyLog(res.data);
        } catch (error) {
            console.error("Error refreshing status:", error);
        }
    };

    const handlePrayerToggle = async (prayerKey) => {
        if (dailyLog.isSubmitted) return;
        try {
            // Optimistic update
            const updatedLog = { ...dailyLog };
            updatedLog.prayers[prayerKey] = !updatedLog.prayers[prayerKey];
            
            // Recalculate local count for immediate UI feedback
            const prayerList = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let count = 0;
            prayerList.forEach(p => {
                if (updatedLog.prayers[p]) count++;
            });
            updatedLog.prayers.count = count;
            
            setDailyLog(updatedLog);

            // Server update
            const res = await api.post('/dashboard/toggle-prayer', { prayer: prayerKey });
            setDailyLog(res.data);
        } catch (error) {
            console.error("Error toggling prayer:", error);
            // Revert on error (optional, but good practice)
            fetchData(); 
        }
    };

    const handleUpdate = async (updates) => {
        if (dailyLog.isSubmitted) return;
        try {
            const res = await api.patch('/dashboard/update', updates);
            setDailyLog(res.data);
        } catch (error) {
            console.error("Error updating log:", error);
        }
    };

    const handleAddReviseProblem = async () => {
        if (dailyLog.isSubmitted) return;
        if (!newReviseProblem.trim()) return;
        try {
            await api.post('/revise', { problemLink: newReviseProblem });
            setNewReviseProblem('');
            // Refresh queue
            const res = await api.get('/revise');
            setReviseQueue(res.data.data || []);
        } catch (error) {
            console.error("Error adding revise problem:", error);
            alert(error.response?.data?.message || "Error adding problem");
        }
    };

    const handlePopReviseProblem = async () => {
        if (dailyLog.isSubmitted) return;
        try {
            await api.delete('/revise/pop');
            // Refresh queue and daily log (since pop updates daily log for heatmap)
            const [reviseRes, todayRes] = await Promise.all([
                api.get('/revise'),
                api.get('/dashboard/today')
            ]);
            setReviseQueue(reviseRes.data.data || []);
            setDailyLog(todayRes.data);
        } catch (error) {
            console.error("Error popping problem:", error);
            alert(error.response?.data?.message || "Error popping problem");
        }
    };

    const updateAcademicStatus = async (newTodoList) => {
        const allDone = newTodoList.length > 0 && newTodoList.every(t => t.isDone);
        await handleUpdate({
            'academic.todoList': newTodoList,
            'academic.hoursDone': allDone ? 3 : 0
        });
    };

    const addAcademicTask = async () => {
        const updatedList = [...dailyLog.academic.todoList, { task: newAcademicTask, isDone: false }];
        await updateAcademicStatus(updatedList);
        setNewAcademicTask('');
    };

    const toggleAcademicTask = async (index) => {
        const updatedList = [...dailyLog.academic.todoList];
        updatedList[index].isDone = !updatedList[index].isDone;
        await updateAcademicStatus(updatedList);
    };

    const deleteAcademicTask = async (index) => {
        const updatedList = dailyLog.academic.todoList.filter((_, i) => i !== index);
        await updateAcademicStatus(updatedList);
    };

    const handleAcademicGlobalCheck = async () => {
        const isComplete = dailyLog.academic.hoursDone >= 3;
        const newStatus = !isComplete;
        
        const updatedList = dailyLog.academic.todoList.map(t => ({ ...t, isDone: newStatus }));
        
        await handleUpdate({
            'academic.hoursDone': newStatus ? 3 : 0,
            'academic.todoList': updatedList
        });
    };

    const workoutExercises = [
        { key: 'pushups', label: '20 Push Ups' },
        { key: 'situps', label: '20 Situps' },
        { key: 'squats', label: '20 Squats' },
        { key: 'biceps', label: '20 Biceps Curl' },
        { key: 'deadlift', label: '20 Deadlift' },
        { key: 'running', label: '40 Min Running' }
    ];

    const handleWorkoutCheck = (key) => {
        const currentChecklist = dailyLog.workout.checklist || {};
        const newStatus = !currentChecklist[key];
        
        const allKeys = workoutExercises.map(e => e.key);
        const willBeComplete = allKeys.every(k => k === key ? newStatus : currentChecklist[k]);

        handleUpdate({
            [`workout.checklist.${key}`]: newStatus,
            'workout.isCompleted': willBeComplete
        });
    };

    const handleGlobalWorkoutCheck = () => {
        const newState = !dailyLog.workout.isCompleted;
        const updates = { 'workout.isCompleted': newState };
        workoutExercises.forEach(e => {
            updates[`workout.checklist.${e.key}`] = newState;
        });
        handleUpdate(updates);
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Midnight Brain...</div>;

    // Merge dailyLog into history for real-time updates
    const mergedHistory = history.map(h => {
        if (dailyLog && new Date(h.date).toDateString() === new Date(dailyLog.date).toDateString()) {
            return dailyLog;
        }
        return h;
    });

    // If today is not in history yet (new day), add it
    if (dailyLog && !mergedHistory.find(h => new Date(h.date).toDateString() === new Date(dailyLog.date).toDateString())) {
        mergedHistory.push(dailyLog);
    }

    // Helper to normalize date for heatmap
    const toHeatmapDate = (dateStr) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        // Create date object from string
        const date = new Date(dateStr);
        // Adjust for local timezone offset to ensure it falls on the correct local day
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    // Prepare Heatmap Data
    const masterHeatmapData = mergedHistory.map(log => ({
        date: toHeatmapDate(log.date),
        count: log.consistencyScore
    }));

    const codeforcesHeatmapData = mergedHistory.map(log => ({
        date: toHeatmapDate(log.date),
        count: log.codeforces.solvedCount
    }));

    const leetcodeHeatmapData = mergedHistory.map(log => ({
        date: toHeatmapDate(log.date),
        count: log.leetcode?.status === 'SOLVED' ? 1 : 0
    }));

    const revisionHeatmapData = mergedHistory.map(log => {
        const solved = log.revision.problems.filter(p => p.status === 'SOLVED').length;
        const total = log.revision.totalDue || Math.max(solved, 1); 
        
        return {
            date: toHeatmapDate(log.date),
            count: solved,
            max: total
        };
    });

    const prayersHeatmapData = mergedHistory.map(log => ({
        date: toHeatmapDate(log.date),
        count: log.prayers.count,
        max: 5
    }));

    const workoutHeatmapData = mergedHistory.map(log => {
        // Calculate completed exercises count
        const checklist = log.workout?.checklist || {};
        const completedCount = Object.values(checklist).filter(Boolean).length;
        const totalExercises = Object.keys(checklist).length || 1;

        return {
            date: toHeatmapDate(log.date),
            count: completedCount,
            max: totalExercises
        };
    });

    const academicHeatmapData = mergedHistory.map(log => {
        const tasks = log.academic?.todoList || [];
        const totalTasks = tasks.length;
        
        if (totalTasks > 0) {
            const completedTasks = tasks.filter(t => t.isDone).length;
            return {
                date: toHeatmapDate(log.date),
                count: completedTasks,
                max: totalTasks
            };
        }
        
        return {
            date: toHeatmapDate(log.date),
            count: log.academic.hoursDone,
            max: log.academic.hoursTarget || 3
        };
    });

    const kaggleHeatmapData = mergedHistory.map(log => {
        const tasks = log.kaggle?.todoList || [];
        const totalTasks = tasks.length;
        
        if (totalTasks > 0) {
            const completedTasks = tasks.filter(t => t.isDone).length;
            return {
                date: toHeatmapDate(log.date),
                count: completedTasks,
                max: totalTasks
            };
        }

        return {
            date: toHeatmapDate(log.date),
            count: log.kaggle.minutesDone,
            max: log.kaggle.targetMinutes || 60
        };
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12 border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-green-400">Consistency Architect</h1>
                    <p className="text-slate-400 mt-2">{new Date().toDateString()}</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-700 text-center">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
                        <div className="text-3xl font-bold text-green-400">{dailyLog.consistencyScore}%</div>
                    </div>
                    <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-700 text-center">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Level</span>
                        <div className="text-3xl font-bold text-blue-400">{dailyLog.workout.level}</div>
                    </div>
                </div>
            </header>

            {/* Quote of the Day */}
            {quote && (
                <div className="mb-12 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
                    <blockquote className="text-xl italic text-slate-300 mb-2 font-serif">
                        "{quote.text}"
                    </blockquote>
                    <div className="text-right text-emerald-400 font-semibold">
                        — {quote.author}
                    </div>
                </div>
            )}

            {/* Master Heatmap */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-slate-300">Master Consistency</h2>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <EfficiencyHeatmap 
                        data={masterHeatmapData} 
                        colorClass="text-green-500" 
                        onClick={handleDayClick}
                        variant="mixed-yellow-green"
                        maxValue={100}
                    />
                </div>
            </section>

            {/* Badges Section */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="text-yellow-400" />
                    <h2 className="text-xl font-semibold text-slate-300">Achievements</h2>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <BadgeList badges={badges} />
                </div>
            </section>

            {/* The List */}
            <div className="space-y-8">
                
                {/* 1. Prayer */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-emerald-400">1. Prayer</h2>
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {dailyLog.prayers.count}/5
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col justify-center gap-2">
                            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
                                const prayerKey = prayer.toLowerCase();
                                return (
                                    <label key={prayer} className={`flex items-center gap-3 p-3 bg-slate-800 rounded-lg transition-colors ${dailyLog.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'}`}>
                                        <input 
                                            type="checkbox"
                                            checked={dailyLog.prayers[prayerKey]}
                                            onChange={() => handlePrayerToggle(prayerKey)}
                                            disabled={dailyLog.isSubmitted}
                                            className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700 disabled:opacity-50"
                                        />
                                        <span className={dailyLog.prayers[prayerKey] ? "text-emerald-400 line-through" : "text-slate-300"}>{prayer}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <div>
                            <EfficiencyHeatmap data={prayersHeatmapData} colorClass="text-emerald-500" variant="mixed-yellow-green" />
                        </div>
                    </div>
                </section>

                {/* 2. Workout */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-blue-400">2. Workout</h2>
                        <div className="text-right">
                            <div className="text-xl text-slate-400">Level {dailyLog.workout.level}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                {workoutExercises.map((ex) => (
                                    <label key={ex.key} className={`flex items-center gap-2 p-2 bg-slate-800 rounded transition-colors ${dailyLog.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'}`}>
                                        <input 
                                            type="checkbox"
                                            checked={dailyLog.workout.checklist?.[ex.key] || false}
                                            onChange={() => handleWorkoutCheck(ex.key)}
                                            disabled={dailyLog.isSubmitted}
                                            className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 disabled:opacity-50"
                                        />
                                        <span className={`text-sm ${dailyLog.workout.checklist?.[ex.key] ? "text-blue-400 line-through" : "text-slate-300"}`}>{ex.label}</span>
                                    </label>
                                ))}
                            </div>
                            <label className={`flex items-center gap-4 p-4 bg-slate-800 rounded-xl transition-colors w-full justify-center border border-slate-600 mt-2 ${dailyLog.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'}`}>
                                <input 
                                    type="checkbox"
                                    checked={dailyLog.workout.isCompleted}
                                    onChange={handleGlobalWorkoutCheck}
                                    disabled={dailyLog.isSubmitted}
                                    className="w-6 h-6 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 disabled:opacity-50"
                                />
                                <span className="text-xl font-semibold">Workout Completed</span>
                            </label>
                        </div>
                        <div>
                            <EfficiencyHeatmap data={workoutHeatmapData} colorClass="text-blue-500" variant="mixed-yellow-green" />
                        </div>
                    </div>
                </section>

                {/* 3. Coding Phase */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-green-400 mb-6">3. Coding Phase</h2>
                    
                    {/* Codeforces */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-300">Codeforces</h3>
                            <button 
                                onClick={handleRefreshStatus} 
                                disabled={dailyLog.isSubmitted}
                                className={`text-sm ${dailyLog.isSubmitted ? 'text-slate-500 cursor-not-allowed' : 'text-green-400 hover:text-green-300'}`}
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <div className="text-sm text-slate-400 mb-2">Problems Solved Today</div>
                                <div className="text-3xl font-bold text-green-400">{dailyLog.codeforces.solvedCount}</div>
                                <div className="mt-4 space-y-3">
                                    {dailyLog.codeforces.targetProblems.map((p, i) => (
                                        <a 
                                            key={i} 
                                            href={p.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block text-sm font-medium truncate hover:underline transition-colors ${
                                                p.status === 'SOLVED' ? 'text-green-400' : 'text-slate-300 hover:text-green-300'
                                            }`}
                                        >
                                            {i + 1}. {p.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <EfficiencyHeatmap data={codeforcesHeatmapData} colorClass="text-green-500" maxValue={6} variant="mixed-yellow-green" />
                        </div>
                    </div>

                    {/* LeetCode */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">LeetCode</h3>
                        <div className="flex flex-col gap-6">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                {dailyLog.leetcode.link ? (
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox"
                                            checked={dailyLog.leetcode.status === 'SOLVED'}
                                            onChange={(e) => handleUpdate({ 'leetcode.status': e.target.checked ? 'SOLVED' : 'PENDING' })}
                                            disabled={dailyLog.isSubmitted}
                                            className="w-5 h-5 rounded border-slate-600 text-yellow-500 focus:ring-yellow-500 bg-slate-700 disabled:opacity-50"
                                        />
                                        <a 
                                            href={dailyLog.leetcode.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`text-sm font-medium flex items-center gap-2 hover:underline ${
                                                dailyLog.leetcode.status === 'SOLVED' ? 'text-yellow-400 line-through' : 'text-yellow-400'
                                            }`}
                                        >
                                            <ExternalLink size={16} />
                                            Daily Challenge
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-sm italic">
                                        Waiting for daily problem (available after 6 AM)...
                                    </div>
                                )}
                            </div>
                            <EfficiencyHeatmap data={leetcodeHeatmapData} colorClass="text-yellow-500" />
                        </div>
                    </div>

                    {/* Revision */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Revision Queue</h3>
                        <div className="flex flex-col gap-6">
                            {/* Controls */}
                            <div className="flex flex-col gap-4 bg-slate-800 p-4 rounded-lg">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newReviseProblem}
                                        onChange={(e) => setNewReviseProblem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddReviseProblem()}
                                        placeholder="Paste Codeforces Link..."
                                        disabled={dailyLog.isSubmitted}
                                        className="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-sm text-slate-200 disabled:opacity-50"
                                    />
                                    <button 
                                        onClick={handleAddReviseProblem} 
                                        disabled={dailyLog.isSubmitted}
                                        className="bg-pink-600 hover:bg-pink-500 px-4 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">{reviseQueue.length} problems in queue</span>
                                    <button 
                                        onClick={handlePopReviseProblem} 
                                        disabled={reviseQueue.length === 0 || dailyLog.isSubmitted}
                                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded text-white text-sm disabled:cursor-not-allowed"
                                    >
                                        Pop & Revise Next
                                    </button>
                                </div>
                            </div>

                            {/* Queue List (Table) */}
                            {reviseQueue.length > 0 && (
                                <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 border-b border-slate-700">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Problem Link</th>
                                                <th className="px-4 py-3 font-semibold">Watched Date</th>
                                                <th className="px-4 py-3 font-semibold">Revise Date</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviseQueue.map((problem, index) => {
                                                const reviseToday = isToday(problem.reviseDate);
                                                const daysUntil = getDaysUntil(problem.reviseDate);
                                                
                                                return (
                                                    <tr 
                                                        key={problem._id} 
                                                        className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                                                            reviseToday ? 'bg-yellow-900/10' : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <a
                                                                href={problem.problemLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 hover:underline"
                                                            >
                                                                <ExternalLink size={14} />
                                                                {problem.problemLink.length > 40 
                                                                    ? problem.problemLink.substring(0, 40) + '...' 
                                                                    : problem.problemLink}
                                                            </a>
                                                            {index === 0 && (
                                                                <span className="inline-block mt-1 text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-700/50">
                                                                    NEXT UP
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} />
                                                                {formatDate(problem.dateWatchedEditorial)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} className={reviseToday ? 'text-yellow-500' : 'text-slate-400'} />
                                                                <span className={reviseToday ? 'font-bold text-yellow-500' : 'text-slate-400'}>
                                                                    {formatDate(problem.reviseDate)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {reviseToday ? (
                                                                <span className="inline-flex items-center gap-1 bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-700/50">
                                                                    ⏰ Revise Today!
                                                                </span>
                                                            ) : daysUntil < 0 ? (
                                                                <span className="inline-flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-1 rounded-full text-xs font-semibold border border-red-700/50">
                                                                    🔴 Overdue ({Math.abs(daysUntil)}d ago)
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold border border-blue-700/50">
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
                            )}

                            <EfficiencyHeatmap data={revisionHeatmapData} colorClass="text-pink-500" title="Revision Consistency" maxValue={100} variant="mixed-yellow-green" />
                        </div>
                    </div>
                </section>

                {/* 4. Academic */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-orange-400">4. Academic</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 font-semibold">Target: 3 Hours</span>
                            <label className={`flex items-center gap-2 transition-colors ${dailyLog.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input 
                                    type="checkbox"
                                    checked={dailyLog.academic.hoursDone >= 3}
                                    onChange={handleAcademicGlobalCheck}
                                    disabled={dailyLog.isSubmitted}
                                    className="w-6 h-6 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-700 disabled:opacity-50"
                                />
                                <span className="text-slate-300">Mark Complete</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        {/* Today's Tasks (Fixed) */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Today's Focus</h3>
                            <div className="space-y-2 mb-4">
                                {dailyLog.academic.todoList.length > 0 ? (
                                    dailyLog.academic.todoList.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <input 
                                                type="checkbox"
                                                checked={item.isDone}
                                                onChange={() => toggleAcademicTask(idx)}
                                                disabled={dailyLog.isSubmitted}
                                                className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-700 disabled:opacity-50"
                                            />
                                            <span className={`flex-1 text-sm ${item.isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.task}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-slate-500 text-sm italic p-2">No tasks set for today.</div>
                                )}
                            </div>
                        </div>

                        {/* Tomorrow's Tasks (Planning) */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Plan for Tomorrow</h3>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={newTomorrowAcademicTask}
                                    onChange={(e) => setNewTomorrowAcademicTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTomorrowTask('academic')}
                                    placeholder="Add academic task for tomorrow..."
                                    disabled={dailyLog.isSubmitted}
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-200 placeholder-slate-500 disabled:opacity-50"
                                />
                                <button 
                                    onClick={() => handleAddTomorrowTask('academic')} 
                                    disabled={dailyLog.isSubmitted}
                                    className="bg-orange-600 hover:bg-orange-500 px-4 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                            <div className="space-y-1">
                                {tomorrowAcademicTasks.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded border border-slate-700/50">
                                        <span className="w-2 h-2 rounded-full bg-orange-500/50"></span>
                                        <span className="text-sm text-slate-300">{item.task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <EfficiencyHeatmap data={academicHeatmapData} colorClass="text-orange-500" variant="mixed-yellow-green" />
                        </div>
                    </div>
                </section>

                {/* 5. Kaggle */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">5. Kaggle</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 font-semibold">Target: 1 Hour</span>
                            <label className={`flex items-center gap-2 transition-colors ${dailyLog.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input 
                                    type="checkbox"
                                    checked={dailyLog.kaggle.minutesDone >= 60}
                                    onChange={(e) => handleUpdate({ 'kaggle.minutesDone': e.target.checked ? 60 : 0 })}
                                    disabled={dailyLog.isSubmitted}
                                    className="w-6 h-6 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700 disabled:opacity-50"
                                />
                                <span className="text-slate-300">Mark Complete</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        {/* Today's Tasks (Fixed) */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Today's Focus</h3>
                            <div className="space-y-2 mb-4">
                                {dailyLog.kaggle.todoList && dailyLog.kaggle.todoList.length > 0 ? (
                                    dailyLog.kaggle.todoList.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <input 
                                                type="checkbox"
                                                checked={item.isDone}
                                                onChange={() => {
                                                    const updatedList = [...dailyLog.kaggle.todoList];
                                                    updatedList[idx].isDone = !updatedList[idx].isDone;
                                                    handleUpdate({ 'kaggle.todoList': updatedList });
                                                }}
                                                disabled={dailyLog.isSubmitted}
                                                className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700 disabled:opacity-50"
                                            />
                                            <span className={`flex-1 text-sm ${item.isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.task}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-slate-500 text-sm italic p-2">No tasks set for today.</div>
                                )}
                            </div>
                        </div>

                        {/* Tomorrow's Tasks (Planning) */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Plan for Tomorrow</h3>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={newTomorrowKaggleTask}
                                    onChange={(e) => setNewTomorrowKaggleTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTomorrowTask('kaggle')}
                                    placeholder="Add Kaggle task for tomorrow..."
                                    disabled={dailyLog.isSubmitted}
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-200 placeholder-slate-500 disabled:opacity-50"
                                />
                                <button 
                                    onClick={() => handleAddTomorrowTask('kaggle')} 
                                    disabled={dailyLog.isSubmitted}
                                    className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                            <div className="space-y-1">
                                {tomorrowKaggleTasks.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded border border-slate-700/50">
                                        <span className="w-2 h-2 rounded-full bg-cyan-500/50"></span>
                                        <span className="text-sm text-slate-300">{item.task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-cyan-400 mb-2">{Math.floor(dailyLog.kaggle.minutesDone / 60)}h {dailyLog.kaggle.minutesDone % 60}m</div>
                                <div className="text-slate-400">Time Invested Today</div>
                            </div>
                        </div>
                        <div>
                            <EfficiencyHeatmap data={kaggleHeatmapData} colorClass="text-cyan-500" variant="mixed-yellow-green" />
                        </div>
                    </div>
                </section>

                {/* Day Reflection & Submission */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mt-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Day Reflection</h2>
                    <div className="space-y-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How did you work hard today? What motivated you? Write your reflection here..."
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-32 resize-none"
                            disabled={dailyLog.isSubmitted}
                        />
                        <div className="flex justify-end">
                            {dailyLog.isSubmitted ? (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                                    <CheckCircle size={20} />
                                    <span className="font-medium">Day Submitted</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSubmitDay}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                >
                                    <Send size={20} />
                                    Submit Day
                                </button>
                            )}
                        </div>
                    </div>
                </section>

            </div>

            <DayDetailsModal 
                day={selectedDay} 
                onClose={() => setSelectedDay(null)} 
            />

            {/* New Badge Alert Modal */}
            {newBadgeAlert && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 border-2 border-yellow-400/50 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />
                        <Award size={64} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-3xl font-bold text-white mb-2">Badge Unlocked!</h2>
                        <p className="text-slate-300 mb-6">You've earned new achievements for your consistency.</p>
                        
                        <div className="space-y-4 mb-8">
                            {newBadgeAlert.map((badge, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
                                    <h3 className="font-bold text-yellow-400">{badge.name}</h3>
                                    <p className="text-sm text-slate-400">{badge.description}</p>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setNewBadgeAlert(null)}
                            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors w-full"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;