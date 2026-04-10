const axios = require('axios');
const DailyLog = require('../models/DailyLog');

const fetchCodeforcesProblems = async (handle) => {
    try {
        // 1. Fetch user submissions to filter out solved problems
        const userStatusUrl = `https://codeforces.com/api/user.status?handle=${handle}`;
        const userStatusRes = await axios.get(userStatusUrl, { timeout: 5000 });
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
        const problemsRes = await axios.get(problemsUrl, { timeout: 5000 });
        
        if (problemsRes.data.status !== 'OK') {
            throw new Error('Failed to fetch problems from Codeforces');
        }

        const allProblems = problemsRes.data.result.problems;
        
        // 3. Filter unsolved problems
        const unsolvedProblems = allProblems.filter(p => 
            !solvedProblems.has(`${p.contestId}${p.index}`)
        );

        // 4. Select 4 random problems
        const selectedProblems = [];
        const usedIndices = new Set();
        
        while (selectedProblems.length < 4 && unsolvedProblems.length > 0) {
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
        let userCurrentRating = 1400; // Default if no rating yet
        
        if (userRatingRes.data.status === 'OK') {
            userRatingRes.data.result.forEach(r => participatedContestIds.add(r.contestId));
            // Get the latest rating from rating history
            if (userRatingRes.data.result.length > 0) {
                userCurrentRating = userRatingRes.data.result[userRatingRes.data.result.length - 1].newRating;
            }
        }

        // 3. Fetch user info to get current rank
        const userInfoUrl = `https://codeforces.com/api/user.info?handles=${handle}`;
        const userInfoRes = await axios.get(userInfoUrl);
        let userRank = 'newbie'; // Default rank
        
        if (userInfoRes.data.status === 'OK' && userInfoRes.data.result.length > 0) {
            userRank = userInfoRes.data.result[0].rank.toLowerCase();
            userCurrentRating = userInfoRes.data.result[0].rating || userCurrentRating;
        }

        // Function to check if a contest is rated for the user
        const isContestRatedForUser = (contestName, userCurrentRating) => {
            const n = contestName.toLowerCase();
            
            // Div 4 is unrated for Specialist or above (rating >= 1400)
            if (n.includes('div. 4')) {
                return userCurrentRating < 1400;
            }
            
            // Div 3 is unrated for Expert or above (rating >= 1600)
            if (n.includes('div. 3')) {
                return userCurrentRating < 1600;
            }
            
            // Div 2 is unrated for Master or above (rating >= 2100)
            if (n.includes('div. 2')) {
                return userCurrentRating < 2100;
            }
            
            // Educational rounds are typically rated for all
            if (n.includes('educational')) return true;
            
            // Global rounds are typically rated for all
            if (n.includes('global round')) return true;
            
            // Other contests (Hello, VK Cup, etc.) are usually rated
            return true;
        };

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
        // For unrated contests, mark as participated (auto-filled)
        const heatmapData = history.map(c => {
            const isRated = isContestRatedForUser(c.name, userCurrentRating);
            const participated = participatedContestIds.has(c.id);
            
            return {
                id: c.id,
                name: c.name,
                startTimeSeconds: c.startTimeSeconds,
                participated: isRated ? participated : true, // Auto-mark unrated contests as participated
                isRated: isRated
            };
        });

        // Calculate Streaks (only considering rated contests)
        let currentStreak = 0;
        let maxStreak = 0;
        let maxStreakLastYear = 0;
        let maxStreakLastMonth = 0;

        const oneYearAgo = Date.now() / 1000 - 365 * 24 * 60 * 60;
        const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;

        // Filter only rated contests for streak calculation
        const ratedContests = heatmapData.filter(c => c.isRated);

        // Calculate Max Streak (All Time)
        let tempStreak = 0;
        ratedContests.forEach(c => {
            if (c.participated) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreak = Math.max(maxStreak, tempStreak);

        // Calculate Current Streak (working backwards from most recent)
        const reversedHistory = [...ratedContests].reverse();
        for (let c of reversedHistory) {
            if (c.participated) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate Max Streak Last Year
        tempStreak = 0;
        ratedContests.filter(c => c.startTimeSeconds >= oneYearAgo).forEach(c => {
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
        ratedContests.filter(c => c.startTimeSeconds >= oneMonthAgo).forEach(c => {
            if (c.participated) {
                tempStreak++;
            } else {
                maxStreakLastMonth = Math.max(maxStreakLastMonth, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreakLastMonth = Math.max(maxStreakLastMonth, tempStreak);

        // Calculate Totals Since 2024 (only rated)
        const totalContestsSince2024 = ratedContests.length;
        const participatedSince2024 = ratedContests.filter(c => c.participated).length;

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
