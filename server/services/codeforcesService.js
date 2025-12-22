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

        // 4. Select 7 random problems
        const selectedProblems = [];
        const usedIndices = new Set();
        
        while (selectedProblems.length < 7 && unsolvedProblems.length > 0) {
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

module.exports = { fetchCodeforcesProblems };
