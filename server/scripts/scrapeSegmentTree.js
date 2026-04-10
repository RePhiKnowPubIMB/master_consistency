const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = 'https://youkn0wwho.academy/topic-list/segment_tree';

async function run() {
    console.log('🚀 Starting browser...');
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    console.log('🌐 Navigating to URL...');
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (e) {
        console.log('⚠️ Navigation timeout or error, proceeding...');
    }

    console.log('⏳ Waiting for problem table...');
    try {
        await page.waitForSelector('table.chakra-table tbody tr', { timeout: 60000 });
        console.log('✅ Found elements.');
    } catch(e) {
        console.log('⚠️ Timeout waiting for elements.');
    }
    
    // Initial wait to ensure data has loaded (Firestore)
    await new Promise(r => setTimeout(r, 10000));

    // Scroll to the bottom to trigger loading of all rows
    console.log('📜 Scrolling to load all rows...');
    for (let i = 0; i < 30; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 5000));

    // Reveal tags by clicking all accordion buttons (the down arrow)
    console.log('🖱️ Clicking accordion buttons to reveal tags...');
    await page.evaluate(async () => {
        // This is assuming the accordion icon is the one that reveals the tags section in the row.
        const buttons = document.querySelectorAll('table.chakra-table tbody tr button.chakra-accordion__button');
        console.log(`Found ${buttons.length} accordion buttons.`);
        for (const btn of buttons) {
            if (btn.getAttribute('aria-expanded') !== 'true') {
                btn.click();
                // Minimal wait as these are locally rendered collapses
                await new Promise(r => setTimeout(r, 100));
            }
        }
    });
    
    // Final wait to ensure all collapses have finished their transitions
    await new Promise(r => setTimeout(r, 10000));

    console.log('🔍 Scraping problems and tags...');
    const problems = await page.evaluate(() => {
        const rows = document.querySelectorAll('table.chakra-table tbody tr');
        let currentProblem = null;
        const results = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                // This is a main problem row
                const link = row.querySelector('a.chakra-link');
                const badge = row.querySelector('span.chakra-badge');
                
                // Clean up serial number by looking at the ID or title text
                let serialRaw = cells[0].textContent.trim();
                let serialMatch = serialRaw.match(/\d+/);
                let serial = serialMatch ? serialMatch[0] : '';

                currentProblem = {
                    serial: serial,
                    title: link ? link.textContent.trim() : 'NO_TITLE',
                    url: link ? link.href : 'NO_URL',
                    difficulty: badge ? badge.textContent.trim() : 'UNKNOWN',
                    tags: []
                };
                results.push(currentProblem);
            } else if (currentProblem) {
                // This is likely an expanded panel row after a click
                const tagsInPanel = row.querySelectorAll('.chakra-stack span.chakra-badge, .chakra-stack span');
                const panelTags = Array.from(tagsInPanel)
                    .map(t => t.textContent.trim())
                    .filter(t => t.length > 2 && !t.match(/Attempted|Completed|Skipped|Ignored/));
                
                if (panelTags.length > 0) {
                    currentProblem.tags = Array.from(new Set([...currentProblem.tags, ...panelTags]));
                }
            }
        });
        return results;
    });

    // Filtering to only include actual problems skip those with "NO_TITLE" or purely educational links
    const validProblems = problems.filter(p => 
        p.title !== 'NO_TITLE' && 
        p.difficulty !== 'UNKNOWN' &&
        (p.url.includes('codeforces') || p.url.includes('atcoder') || p.url.includes('spoj') || p.url.includes('lightoj'))
    );

    console.log(`✅ Found ${validProblems.length} validated problems with tags.`);
    
    const outputPath = path.join(__dirname, '..', 'data', 'segment-tree-problems.json');
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(outputPath, JSON.stringify(problems, null, 2));
    console.log(`💾 Saved to ${outputPath}`);

    await browser.close();
}

run().catch(err => {
    console.error('❌ FATAL:', err);
    process.exit(1);
});
