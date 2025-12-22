const UserConfig = require('../models/UserConfig');
const DailyLog = require('../models/DailyLog');

const BADGE_MILESTONES = [
    { days: 20, tier: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { days: 50, tier: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20' },
    { days: 100, tier: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { days: 200, tier: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { days: 365, tier: 'Diamond', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
];

const CATEGORIES = {
    prayer: { label: 'Faith Keeper', icon: 'Moon' },
    workout: { label: 'Iron Will', icon: 'Dumbbell' },
    coding: { label: 'Code Master', icon: 'Terminal' },
    academic: { label: 'Scholar', icon: 'BookOpen' },
    kaggle: { label: 'Data Wizard', icon: 'Brain' },
    overall: { label: 'Consistency King', icon: 'Crown' }
};

async function checkAndAwardBadges(userConfig) {
    // 1. Calculate Stats from DailyLogs
    // We need to count "successful" days for each category
    const logs = await DailyLog.find({ isSubmitted: true }); // Only count submitted days

    const stats = {
        prayer: 0,
        workout: 0,
        coding: 0,
        academic: 0,
        kaggle: 0,
        overall: 0
    };

    logs.forEach(log => {
        // Prayer: 5 prayers
        if (log.prayers && log.prayers.count >= 5) stats.prayer++;

        // Workout: Completed
        if (log.workout && log.workout.isCompleted) stats.workout++;

        // Coding: Codeforces >= 7 OR LeetCode Solved OR Revision Solved
        // Let's be strict: Codeforces OR LeetCode must be done
        const cfDone = log.codeforces && log.codeforces.solvedCount >= 1; // At least 1 for consistency? Or target? Let's say target (usually 1-2 for daily)
        // Actually schema says targetProblems. 
        // Let's use the score logic: if consistencyScore > 0 it means something was done.
        // But for specific badges, let's check specific fields.
        
        // Coding: 
        if ((log.codeforces && log.codeforces.solvedCount >= 1) || (log.leetcode && log.leetcode.status === 'SOLVED')) stats.coding++;

        // Academic: Hours target met
        if (log.academic && log.academic.hoursDone >= log.academic.hoursTarget) stats.academic++;

        // Kaggle: Minutes target met
        if (log.kaggle && log.kaggle.minutesDone >= log.kaggle.targetMinutes) stats.kaggle++;

        // Overall: Consistency Score >= 80%
        if (log.consistencyScore >= 80) stats.overall++;
    });

    const newBadges = [];

    // 2. Check Milestones
    for (const [catKey, catCount] of Object.entries(stats)) {
        for (const milestone of BADGE_MILESTONES) {
            if (catCount >= milestone.days) {
                // Check if badge already exists
                const badgeId = `${catKey}-${milestone.days}`;
                const exists = userConfig.badges.some(b => b.id === badgeId);

                if (!exists) {
                    const badge = {
                        id: badgeId,
                        name: `${CATEGORIES[catKey].label}`,
                        description: `Consistent in ${catKey} for ${milestone.days} days`,
                        icon: CATEGORIES[catKey].icon,
                        category: catKey,
                        tier: milestone.tier,
                        dateEarned: new Date()
                    };
                    userConfig.badges.push(badge);
                    newBadges.push(badge);
                }
            }
        }
    }

    if (newBadges.length > 0) {
        await userConfig.save();
    }

    return newBadges;
}

module.exports = { checkAndAwardBadges, BADGE_MILESTONES, CATEGORIES };
