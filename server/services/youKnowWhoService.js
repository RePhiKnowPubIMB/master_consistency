const fs = require('fs');
const path = require('path');

const CATALOG_FILE = path.join(__dirname, '..', 'data', 'ykw-problems.json');

// Cache the catalog in memory
let problemCatalog = null;

/**
 * Load the problem catalog from disk (cached after first load).
 */
function loadCatalog() {
    if (problemCatalog) return problemCatalog;

    try {
        if (!fs.existsSync(CATALOG_FILE)) {
            console.warn('⚠️ YKW catalog not found. Run: node scripts/scrapeYKW.js');
            return [];
        }
        const data = fs.readFileSync(CATALOG_FILE, 'utf-8');
        problemCatalog = JSON.parse(data);
        console.log(`📚 Loaded ${problemCatalog.length} YKW problems from catalog`);
        return problemCatalog;
    } catch (err) {
        console.error('Error loading YKW catalog:', err.message);
        return [];
    }
}

/**
 * Simple date-seeded hash for deterministic daily selection.
 * Same date → same problem, different date → different problem.
 */
function dateSeedHash(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Get today's daily problem from the static catalog.
 * Uses date-seeded selection for consistency within the same day.
 * @param {Date} [date] - Optional date override (defaults to today)
 * @returns {Object|null} Problem object or null if catalog is empty
 */
const fetchDailyYouKnowWhoProblem = async (date) => {
    const catalog = loadCatalog();
    if (catalog.length === 0) return null;

    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const index = dateSeedHash(dateStr) % catalog.length;
    const problem = catalog[index];

    return {
        name: problem.name,
        link: problem.link,
        difficulty: problem.difficulty,
        topic: problem.topic,
        section: problem.section,
        source: problem.source || 'YouKnowWho',
        importance: 3 // All topics are 3★
    };
};

/**
 * Force reload the catalog from disk (e.g., after running the scraper).
 */
const reloadCatalog = () => {
    problemCatalog = null;
    return loadCatalog();
};

/**
 * Get catalog stats for debugging.
 */
const getCatalogStats = () => {
    const catalog = loadCatalog();
    const sections = {};
    const difficulties = { Easy: 0, Medium: 0 };

    catalog.forEach(p => {
        sections[p.section] = (sections[p.section] || 0) + 1;
        if (difficulties[p.difficulty] !== undefined) difficulties[p.difficulty]++;
    });

    return { totalProblems: catalog.length, sections, difficulties };
};

module.exports = { fetchDailyYouKnowWhoProblem, reloadCatalog, getCatalogStats };
