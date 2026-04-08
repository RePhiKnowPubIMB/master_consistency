const puppeteer = require('puppeteer');

const fetchDailyYouKnowWhoProblem = async () => {
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://youkn0wwho.academy/topic-list', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for topics to load
        await page.waitForSelector('div[data-tour="problems-section"]', { timeout: 10000 });

        // Extract all problems from topics with importance 3★ and difficulty Easy/Medium
        const allProblems = await page.evaluate(() => {
            const problemsData = [];

            // Get all problem rows in the table
            const rows = document.querySelectorAll('div[data-tour="problems-section"] .css-0 .css-1sixqfj tbody tr');
            
            rows.forEach(row => {
                try {
                    // Get problem name
                    const nameCell = row.querySelector('td');
                    const nameLink = nameCell ? nameCell.querySelector('a') : null;
                    const problemName = nameLink ? nameLink.textContent.trim() : '';
                    const problemLink = nameLink ? nameLink.href : '';

                    // Get difficulty badge
                    const difficultyBadge = row.querySelector('span[class*="chakra-badge"]');
                    const difficulty = difficultyBadge ? difficultyBadge.textContent.trim().toUpperCase() : '';

                    // Get importance stars (count the filled stars)
                    const starElements = row.querySelectorAll('svg[viewBox*="24"]');
                    let importance = 0;
                    starElements.forEach(star => {
                        // Check if the star is filled (has fill color)
                        const paths = star.querySelectorAll('path');
                        paths.forEach(path => {
                            const fill = path.getAttribute('fill');
                            // Orange/yellow colors indicate filled stars
                            if (fill && (fill.includes('fbbf24') || fill.includes('f59e0b') || 
                                         fill.includes('fcd34d') || fill.includes('orange') || 
                                         fill.includes('yellow'))) {
                                importance++;
                            }
                        });
                        // Alternative: check parent SVG fill
                        const svgFill = star.getAttribute('fill');
                        if (svgFill && (svgFill.includes('fbbf24') || svgFill.includes('f59e0b') || 
                                       svgFill.includes('fcd34d') || svgFill.includes('orange'))) {
                            importance++;
                        }
                    });

                    // Filter: importance >= 3 and difficulty = EASY or MEDIUM
                    if (problemName && problemLink && importance >= 3 && 
                        (difficulty === 'EASY' || difficulty === 'MEDIUM')) {
                        problemsData.push({
                            name: problemName,
                            link: problemLink,
                            difficulty: difficulty,
                            importance: importance
                        });
                    }
                } catch (e) {
                    console.error('Error parsing problem row:', e.message);
                }
            });

            return problemsData;
        });

        await browser.close();

        // Select random problem from filtered list
        if (allProblems.length === 0) {
            console.log('No problems found with importance >= 3 and difficulty Easy/Medium');
            return null;
        }

        const randomProblem = allProblems[Math.floor(Math.random() * allProblems.length)];
        
        return {
            name: randomProblem.name,
            link: randomProblem.link,
            difficulty: randomProblem.difficulty,
            importance: randomProblem.importance,
            source: 'YouKnowWho'
        };

    } catch (error) {
        console.error('Error in fetchDailyYouKnowWhoProblem:', error.message);
        if (browser) {
            await browser.close();
        }
        return null;
    }
};

module.exports = { fetchDailyYouKnowWhoProblem };
