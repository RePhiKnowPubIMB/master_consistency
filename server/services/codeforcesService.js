const axios = require('axios');
const DailyLog = require('../models/DailyLog');

const fetchCodeforcesProblems = async (handle) => {
    try {
        // 1. Fetch user submissions to filter out solved problems
        const userStatusUrl = `https://codeforces.com/api/user.status?handle=${handle}`;
        const userStatusRes = await axios.get(userStatusUrl);
        const solvedProblems = new Set();
        
        if (userStatusRes.data.status === 'OK') {
            userStatusRes.data.result.forEach(submission => {
                if (submission.verdict === 'OK') {
                    solvedProblems.add(`${submission.problem.contestId}${submission.problem.index}`);
                }
            });
        }

        // 2. Fetch problems with rating 1700
        const problemsUrl = 'https://codeforces.com/api/problemset.problems?tags=1700';
        const problemsRes = await axios.get(problemsUrl);
        
        if (problemsRes.data.status !== 'OK') {
            throw new Error('Failed to fetch problems from Codeforces');
        }

        const allProblems = problemsRes.data.result.problems;
        
        // 3. Filter unsolved problems
        const unsolvedProblems = allProblems.filter(p => 
            !solvedProblems.has(`${p.contestId}${p.index}`)
        );

        // 4. Select 6 random problems
        const selectedProblems = [];
        const usedIndices = new Set();
        
        while (selectedProblems.length < 6 && unsolvedProblems.length > 0) {
            const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                const p = unsolvedProblems[randomIndex];
                selectedProblems.push({
                    problemId: `${p.contestId}${p.index}`,
                    name: p.name,
                    link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
                    status: 'PENDING'
                });
            }
            // Safety break if we run out of unique problems (unlikely for 1700 tag)
            if (usedIndices.size === unsolvedProblems.length) break;
        }

        return selectedProblems;

    } catch (error) {
        console.error('Error in fetchCodeforcesProblems:', error);
        return [];
    }
};

const getContestData = async (handle) => {
    try {
        // 1. Fetch all contests
        const contestListUrl = 'https://codeforces.com/api/contest.list?gym=false';
        const contestListRes = await axios.get(contestListUrl);
        
        if (contestListRes.data.status !== 'OK') {
            throw new Error('Failed to fetch contest list');
        }

        // 2. Fetch user rating history to check participation
        const userRatingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`;
        const userRatingRes = await axios.get(userRatingUrl);
        
        const participatedContestIds = new Set();
        if (userRatingRes.data.status === 'OK') {
            userRatingRes.data.result.forEach(r => participatedContestIds.add(r.contestId));
        }

        const allContests = contestListRes.data.result;

        // Filter Logic
        const isRelevantContest = (name) => {
            const n = name.toLowerCase();
            if (n.includes('mirror')) return false;
            
            // Exclude Div 1 only contests (User is likely Div 2/3/4)
            if (n.includes('div. 1') && !n.includes('div. 2')) return false;

            return (
                n.includes('div. 4') ||
                n.includes('div. 3') ||
                n.includes('div. 2') || 
                n.includes('educational') ||
                n.includes('global round') ||
                n.includes('good bye') ||
                n.includes('hello 20') ||
                n.includes('codeton') ||
                n.includes('pinely') ||
                n.includes('vk cup') ||
                n.includes('epic') ||
                n.includes('codeforces round') // Catch-all for things like "Refact.ai Match 1 (Codeforces Round 985)"
            );
        };

        // Upcoming Contests
        const upcoming = allContests
            .filter(c => c.phase === 'BEFORE' && isRelevantContest(c.name))
            .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds); // Nearest first

        // Past Contests (History) - From 2024 onwards
        const startOf2024 = new Date('2024-01-01').getTime() / 1000;
        const history = allContests
            .filter(c => c.phase === 'FINISHED' && isRelevantContest(c.name) && c.startTimeSeconds >= startOf2024)
            .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds); // Oldest first

        // Map history to participation status
        const heatmapData = history.map(c => ({
            id: c.id,
            name: c.name,
            startTimeSeconds: c.startTimeSeconds,
            participated: participatedContestIds.has(c.id)
        }));

        // Calculate Streaks
        let currentStreak = 0;
        let maxStreak = 0;
        let maxStreakLastYear = 0;
        let maxStreakLastMonth = 0;

        const oneYearAgo = Date.now() / 1000 - 365 * 24 * 60 * 60;
        const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;

        // Calculate Max Streak (All Time)
        let tempStreak = 0;
        heatmapData.forEach(c => {
            if (c.participated) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreak = Math.max(maxStreak, tempStreak);

        // Calculate Current Streak (working backwards from most recent)
        const reversedHistory = [...heatmapData].reverse();
        for (let c of reversedHistory) {
            if (c.participated) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate Max Streak Last Year
        tempStreak = 0;
        heatmapData.filter(c => c.startTimeSeconds >= oneYearAgo).forEach(c => {
            if (c.participated) {
                tempStreak++;
            } else {
                maxStreakLastYear = Math.max(maxStreakLastYear, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreakLastYear = Math.max(maxStreakLastYear, tempStreak);

        // Calculate Max Streak Last Month
        tempStreak = 0;
        heatmapData.filter(c => c.startTimeSeconds >= oneMonthAgo).forEach(c => {
            if (c.participated) {
                tempStreak++;
            } else {
                maxStreakLastMonth = Math.max(maxStreakLastMonth, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreakLastMonth = Math.max(maxStreakLastMonth, tempStreak);

        // Calculate Totals Since 2024
        const totalContestsSince2024 = heatmapData.length;
        const participatedSince2024 = heatmapData.filter(c => c.participated).length;

        return {
            upcoming,
            heatmap: heatmapData,
            stats: {
                currentStreak,
                maxStreak,
                maxStreakLastYear,
                maxStreakLastMonth,
                totalContestsSince2024,
                participatedSince2024
            }
        };

    } catch (error) {
        console.error('Error fetching contest data:', error);
        // Return empty structure on error to prevent crash
        return { upcoming: [], heatmap: [], stats: { currentStreak: 0, maxStreak: 0, maxStreakLastYear: 0, maxStreakLastMonth: 0 } };
    }
};

module.exports = { fetchCodeforcesProblems, getContestData };
