const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const UserConfig = require('../models/UserConfig');
const axios = require('axios');
const { generateDailyLog } = require('../services/cronService');
const { getDailyQuote } = require('../services/quoteService');

// Helper to fetch LeetCode
async function fetchLeetCodeLink() {
    try {
        const query = `
            query questionOfToday {
                activeDailyCodingChallengeQuestion {
                    link
                    question {
                        title
                        titleSlug
                    }
                }
            }
        `;
        const response = await axios.post('https://leetcode.com/graphql', {
            query: query
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const data = response.data.data.activeDailyCodingChallengeQuestion;
        return `https://leetcode.com${data.link}`;
    } catch (error) {
        console.error("LeetCode Fetch Error:", error.message);
        return null;
    }
}

// Helper to fetch Codeforces Problems
async function fetchDailyCodeforcesProblems(log) {
    try {
        let userConfig = await UserConfig.findOne();
        if (!userConfig) {
            userConfig = new UserConfig();
            await userConfig.save();
        }

        const handle = userConfig.username || 'RePhiKnowPubIMB';
        let currentRating = userConfig.codeforces?.currentRating || 1700;

        // 1. Fetch User Submissions
        const subRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        if (subRes.data.status !== 'OK') return;

        const submissions = subRes.data.result;
        const solvedSet = new Set();
        
        submissions.forEach(s => {
            if (s.verdict === 'OK') {
                solvedSet.add(`${s.problem.contestId}${s.problem.index}`);
            }
        });

        // 2. Determine Rating (Check if we need to level up)
        let solvedCount = 0;
        const countSolvedForRating = (rating) => {
            const distinctSolved = new Set();
            submissions.forEach(s => {
                if (s.verdict === 'OK' && s.problem.rating === rating) {
                    distinctSolved.add(`${s.problem.contestId}${s.problem.index}`);
                }
            });
            return distinctSolved.size;
        };

        solvedCount = countSolvedForRating(currentRating);

        while (solvedCount >= 200) {
            currentRating += 100;
            solvedCount = countSolvedForRating(currentRating);
        }

        // Update Config
        userConfig.codeforces = { currentRating, solvedCount };
        await userConfig.save();

        // 3. Fetch Problemset
        const probRes = await axios.get('https://codeforces.com/api/problemset.problems');
        if (probRes.data.status !== 'OK') return;

        const allProblems = probRes.data.result.problems;

        // 4. Filter & Sort
        // Criteria: Rating == currentRating, ContestId >= 900 (Approx 2018), Not Solved
        const candidates = allProblems.filter(p => {
            return p.rating === currentRating && 
                   p.contestId >= 900 && 
                   !solvedSet.has(`${p.contestId}${p.index}`);
        });

        // Sort by contestId DESC (Latest first)
        candidates.sort((a, b) => b.contestId - a.contestId);

        // Take top 6
        const selected = candidates.slice(0, 6);

        // 5. Update Log
        log.codeforces.targetProblems = selected.map(p => ({
            problemId: `${p.contestId}${p.index}`,
            name: p.name,
            link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
            status: 'PENDING'
        }));

        await log.save();

    } catch (error) {
        console.error("CF Fetch Error:", error.message);
    }
}

// Helper to check Codeforces Status
async function checkCodeforcesStatus(log) {
    try {
        const userConfig = await UserConfig.findOne();
        if (!userConfig) return;

        const response = await axios.get(`https://codeforces.com/api/user.status?handle=${userConfig.username}&from=1&count=50`);
        
        if (response.data.status === 'OK') {
            const submissions = response.data.result;
            let updated = false;

            // Check Daily Problems
            log.codeforces.targetProblems.forEach(problem => {
                if (problem.status === 'PENDING') {
                    const solved = submissions.find(s => 
                        `${s.problem.contestId}${s.problem.index}` === problem.problemId && 
                        s.verdict === 'OK'
                    );
                    if (solved) {
                        problem.status = 'SOLVED';
                        log.codeforces.solvedCount++;
                        updated = true;
                    }
                }
            });

            // Check Revision Problems
            log.revision.problems.forEach(problem => {
                 if (problem.status === 'PENDING') {
                    const solved = submissions.find(s => 
                        `${s.problem.contestId}${s.problem.index}` === problem.problemId && 
                        s.verdict === 'OK'
                    );
                    if (solved) {
                        problem.status = 'SOLVED';
                        updated = true;
                    }
                }
            });

            if (updated) {
                await calculateScore(log);
                await log.save();
            }
        }
    } catch (error) {
        console.error("CF Status Check Error:", error.message);
    }
}

// Get Daily Quote
router.get('/quote', async (req, res) => {
    try {
        const quote = await getDailyQuote();
        res.json(quote || { text: "Consistency is key.", author: "Unknown" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get today's dashboard data
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let log = await DailyLog.findOne({ date: today });
        
        if (!log) {
            // If no log exists (e.g., first run or missed cron), generate it now
            await generateDailyLog();
            log = await DailyLog.findOne({ date: today });
        }

        // Check for LeetCode Daily (After 6 AM)
        const now = new Date();
        if (now.getHours() >= 6 && !log.leetcode.link) {
            const link = await fetchLeetCodeLink();
            if (link) {
                log.leetcode.link = link;
                await log.save();
            }
        }

        // Check for Codeforces Daily (If empty)
        if (!log.codeforces.targetProblems || log.codeforces.targetProblems.length === 0) {
            await fetchDailyCodeforcesProblems(log);
            // Reload log after update
            log = await DailyLog.findOne({ date: today });
        }

        // Check Status on Load
        await checkCodeforcesStatus(log);

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all logs for heatmap
router.get('/history', async (req, res) => {
    try {
        const logs = await DailyLog.find().sort({ date: 1 });
        // Only return score if submitted, otherwise 0 (colorless)
        const historyData = logs.map(log => ({
            ...log.toObject(),
            consistencyScore: log.isSubmitted ? log.consistencyScore : 0
        }));
        res.json(historyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update manual fields (prayers, academic, workout status)
router.patch('/update', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updates = req.body; // Expecting partial DailyLog object
        const log = await DailyLog.findOneAndUpdate({ date: today }, updates, { new: true });
        
        // Recalculate score after update
        if (log) {
            await calculateScore(log);
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Refresh Status (Check Codeforces)
router.post('/refresh-status', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const log = await DailyLog.findOne({ date: today });
        
        if (!log) return res.status(404).json({ message: 'Data not found' });

        await checkCodeforcesStatus(log);
        
        res.json(log);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Tomorrow's Task
router.post('/tomorrow-task', async (req, res) => {
    try {
        const { type, task } = req.body; // type: 'academic' or 'kaggle'
        
        let userConfig = await UserConfig.findOne();
        if (!userConfig) {
            userConfig = new UserConfig();
        }

        if (type === 'academic') {
            userConfig.academic.tomorrowTasks.push({ task });
        } else if (type === 'kaggle') {
            userConfig.kaggle.tomorrowTasks.push({ task });
        }

        await userConfig.save();
        res.json({ message: 'Task added for tomorrow', tasks: userConfig[type].tomorrowTasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Tomorrow's Tasks
router.get('/tomorrow-tasks', async (req, res) => {
    try {
        const userConfig = await UserConfig.findOne();
        res.json({
            academic: userConfig?.academic?.tomorrowTasks || [],
            kaggle: userConfig?.kaggle?.tomorrowTasks || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { checkAndAwardBadges } = require('../services/badgeService');

// Submit Day
router.post('/submit-day', async (req, res) => {
    try {
        const { comment } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await DailyLog.findOne({ date: today });
        if (!log) {
            return res.status(404).json({ message: 'Daily log not found' });
        }

        log.comment = comment;
        log.isSubmitted = true;
        
        // Recalculate score one last time to be sure
        await calculateScore(log); // This saves the log

        // Check for Badges
        let userConfig = await UserConfig.findOne();
        if (!userConfig) {
            userConfig = new UserConfig();
            await userConfig.save();
        }
        const newBadges = await checkAndAwardBadges(userConfig);

        res.json({ message: 'Day submitted successfully', log, newBadges });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Badges
router.get('/badges', async (req, res) => {
    try {
        const userConfig = await UserConfig.findOne();
        res.json(userConfig?.badges || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Day Details
router.get('/day-details/:date', async (req, res) => {
    try {
        const dateStr = req.params.date;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        // We need to handle timezone issues carefully. 
        // The frontend sends YYYY-MM-DD. 
        // Let's try to find by range or exact match if stored as UTC midnight.
        // Since we store `date: today` where `today.setHours(0,0,0,0)`, it depends on server timezone.
        // Assuming the date passed is correct.
        
        const log = await DailyLog.findOne({ date: date });
        
        if (!log) {
             // Fallback: try to find by range if exact match fails due to timezone
             const nextDay = new Date(date);
             nextDay.setDate(date.getDate() + 1);
             const logRange = await DailyLog.findOne({
                 date: {
                     $gte: date,
                     $lt: nextDay
                 }
             });
             if(logRange) return res.json(logRange);
             
             return res.status(404).json({ message: 'Log not found' });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function calculateScore(log) {
    let totalSegments = 0;
    let completedSegments = 0;

    // 1. Codeforces
    totalSegments++;
    if (log.codeforces.solvedCount >= 7) completedSegments++;

    // 2. Revision
    if (log.revision.problems.length > 0) {
        totalSegments++;
        const solvedRev = log.revision.problems.filter(p => p.status === 'SOLVED').length;
        if (solvedRev === log.revision.problems.length) completedSegments++;
    }

    // 3. Prayers
    totalSegments++;
    if (log.prayers.count >= 5) completedSegments++;

    // 4. Workout (if not rest day)
    if (!log.isRestDay) {
        totalSegments++;
        if (log.workout.isCompleted) completedSegments++;
    }

    // 5. Academic
    totalSegments++;
    if (log.academic.hoursDone >= log.academic.hoursTarget) completedSegments++;

    // 6. Kaggle
    totalSegments++;
    if (log.kaggle.minutesDone >= log.kaggle.targetMinutes) completedSegments++;

    log.consistencyScore = totalSegments > 0 ? Math.round((completedSegments / totalSegments) * 100) : 0;
    await log.save();
}

module.exports = router;
