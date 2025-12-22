const cron = require('node-cron');
const DailyLog = require('../models/DailyLog');
const UserConfig = require('../models/UserConfig');
const { fetchCodeforcesProblems } = require('./codeforcesService');

const generateDailyLog = async () => {
    console.log('Running Midnight Brain...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if log already exists
        const existingLog = await DailyLog.findOne({ date: today });
        if (existingLog) {
            console.log('Daily log already exists for today.');
            return;
        }

        // Get User Config
        let userConfig = await UserConfig.findOne();
        if (!userConfig) {
            userConfig = await UserConfig.create({});
        }

        // 1. Day Validation (Fri=5, Sat=6)
        const dayOfWeek = today.getDay();
        const isRestDay = (dayOfWeek === 5 || dayOfWeek === 6);

        // 2. Workout Level Calculator
        const daysPassed = Math.floor((today - userConfig.workout.startDate) / (1000 * 60 * 60 * 24));
        const level = Math.floor(daysPassed / userConfig.workout.cycleDays);
        
        const workoutTargets = {};
        if (!isRestDay) {
            for (const [exercise, base] of Object.entries(userConfig.workout.baseStats)) {
                const increment = userConfig.workout.increment[exercise] || 0;
                const max = userConfig.workout.maxStats[exercise] || Infinity;
                workoutTargets[exercise] = Math.min(base + (level * increment), max);
            }
        }

        // 3. Codeforces Fetcher
        const cfProblems = await fetchCodeforcesProblems(userConfig.username);

        // 4. Revision Logic (7 days ago)
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const oldLog = await DailyLog.findOne({ 
            date: { 
                $gte: sevenDaysAgo, 
                $lt: new Date(sevenDaysAgo.getTime() + 24 * 60 * 60 * 1000) 
            } 
        });

        const revisionProblems = oldLog ? oldLog.codeforces.targetProblems.map(p => ({
            problemId: p.problemId,
            name: p.name,
            link: p.link,
            status: 'PENDING'
        })) : [];

        // 5. Transfer Tomorrow's Tasks to Today
        const academicTasks = userConfig.academic?.tomorrowTasks?.map(t => ({ task: t.task, isDone: false })) || [];
        const kaggleTasks = userConfig.kaggle?.tomorrowTasks?.map(t => ({ task: t.task, isDone: false })) || [];

        // Clear tomorrow's tasks in config
        userConfig.academic.tomorrowTasks = [];
        userConfig.kaggle.tomorrowTasks = [];
        await userConfig.save();

        // Create Daily Log
        const newLog = new DailyLog({
            date: today,
            isRestDay,
            codeforces: {
                targetProblems: cfProblems,
                solvedCount: 0
            },
            revision: {
                problems: revisionProblems
            },
            academic: {
                todoList: academicTasks,
                hoursTarget: 3,
                hoursDone: 0
            },
            kaggle: {
                todoList: kaggleTasks,
                targetMinutes: 60,
                minutesDone: 0
            },
            workout: {
                required: !isRestDay,
                level,
                targets: workoutTargets
            }
        });

        await newLog.save();
        console.log('Daily Log generated successfully.');

    } catch (error) {
        console.error('Error generating daily log:', error);
    }
};

// Schedule: 00:00 every day
const initCron = () => {
    cron.schedule('0 0 * * *', generateDailyLog);
    console.log('Cron job scheduled: Midnight Brain');
};

module.exports = { initCron, generateDailyLog };
