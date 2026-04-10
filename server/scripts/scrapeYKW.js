#!/usr/bin/env node
/**
 * Batch scraper for YouKnowWho Academy topic pages.
 * Extracts Easy/Medium problems from 3★ topics and saves to data/ykw-problems.json.
 * 
 * Usage: 
 *   node scripts/scrapeYKW.js              # Scrape all topics (resume-capable)
 *   node scripts/scrapeYKW.js --section Basics   # Scrape one section
 *   node scripts/scrapeYKW.js --limit 20   # Scrape first 20 topics only
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://youkn0wwho.academy';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'ykw-problems.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'scrape-progress.json');

// Parse CLI args
const args = process.argv.slice(2);
const sectionFilter = args.includes('--section') ? args[args.indexOf('--section') + 1] : null;
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : Infinity;

async function getTopicList(browser) {
    console.log('📋 Fetching topic list from main page...');
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(`${BASE_URL}/topic-list`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Expand all accordion sections
    await page.evaluate(async () => {
        const buttons = document.querySelectorAll('button.chakra-accordion__button');
        for (const b of buttons) {
            if (b.getAttribute('aria-expanded') !== 'true') {
                b.click();
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    });
    await new Promise(r => setTimeout(r, 5000));

    const topics = await page.evaluate(() => {
        const result = [];
        const buttons = document.querySelectorAll('button.chakra-accordion__button');

        buttons.forEach(button => {
            const sectionName = button.innerText.trim().split('\n')[0];
            const panelId = button.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (!panel) return;

            const links = panel.querySelectorAll('a[href^="/topic-list/"]');
            links.forEach(link => {
                result.push({
                    section: sectionName,
                    name: link.textContent.trim().replace(/^\d+\.\s*/, ''),
                    slug: link.getAttribute('href').replace('/topic-list/', ''),
                    path: link.getAttribute('href')
                });
            });
        });

        return result;
    });

    await page.close();
    console.log(`  ✅ Found ${topics.length} topics across all sections`);
    return topics;
}

async function scrapeTopicPage(browser, topic) {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    try {
        await page.goto(`${BASE_URL}${topic.path}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for page content to load (Firestore data)
        await new Promise(r => setTimeout(r, 8000));

        // 1. First check the TOPIC-LEVEL difficulty badge at the top of the page
        const topicInfo = await page.evaluate(() => {
            // The difficulty badge is shown near the top: "Difficulty: EASY" / "VERY EASY" / "MEDIUM" etc.
            const allBadges = document.querySelectorAll('span[class*="badge"], span[class*="Badge"]');
            let topicDifficulty = '';
            allBadges.forEach(badge => {
                const text = badge.textContent.trim().toUpperCase();
                if (['VERY EASY', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].includes(text)) {
                    topicDifficulty = text;
                }
            });

            // Also check for text that says "Difficulty:" followed by a badge
            if (!topicDifficulty) {
                const allText = document.body.innerText;
                const match = allText.match(/Difficulty:\s*(VERY EASY|EASY|MEDIUM|HARD|EXPERT)/i);
                if (match) topicDifficulty = match[1].toUpperCase();
            }

            // Check importance stars
            let importance = 0;
            const importanceSection = document.body.innerText.match(/Importance:/);
            if (importanceSection) {
                const svgs = document.querySelectorAll('svg');
                svgs.forEach(s => {
                    const color = getComputedStyle(s).color;
                    if (color === 'rgb(214, 158, 46)') importance++;
                });
            }

            return { topicDifficulty, importance };
        });

        // 2. SKIP this topic if difficulty is NOT Easy or Medium
        if (topicInfo.topicDifficulty !== 'EASY' && topicInfo.topicDifficulty !== 'MEDIUM') {
            return { skipped: true, reason: topicInfo.topicDifficulty || 'unknown difficulty', problems: [] };
        }

        // 3. SKIP if importance is not 3★
        if (topicInfo.importance < 3) {
            return { skipped: true, reason: `${topicInfo.importance}★ importance`, problems: [] };
        }

        // Scroll to trigger any lazy loading
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));

        // 4. Extract ALL problems from this qualifying topic
        const problems = await page.evaluate((topicMeta) => {
            const result = [];
            const tables = document.querySelectorAll('table');

            for (const table of tables) {
                const headers = Array.from(table.querySelectorAll('thead th')).map(h => h.textContent.trim());
                if (!headers.includes('Problem') && !headers.includes('Difficulty')) continue;

                const probIdx = headers.indexOf('Problem');
                const diffIdx = headers.indexOf('Difficulty');
                const sourceIdx = headers.indexOf('Source');

                const rows = table.querySelectorAll('tbody tr');
                Array.from(rows).forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 5) return;

                    const problemCell = cells[probIdx >= 0 ? probIdx : 3];
                    const diffCell = cells[diffIdx >= 0 ? diffIdx : 4];

                    const problemLink = problemCell?.querySelector('a');
                    const problemName = problemLink?.textContent?.trim() || '';
                    const problemHref = problemLink?.getAttribute('href') || '';
                    const problemDifficulty = diffCell?.textContent?.trim() || '';

                    if (!problemName || !problemHref) return;

                    const sourceCell = cells[sourceIdx >= 0 ? sourceIdx : cells.length - 1];
                    const source = sourceCell?.textContent?.trim() || '';

                    result.push({
                        name: problemName.replace(/^\d+\.\s*/, ''),
                        link: problemHref,
                        difficulty: problemDifficulty,
                        topicDifficulty: topicMeta.topicDifficulty,
                        topic: topicMeta.name,
                        section: topicMeta.section,
                        source
                    });
                });
            }
            return result;
        }, { name: topic.name, section: topic.section, topicDifficulty: topicInfo.topicDifficulty });

        return { skipped: false, problems };

    } catch (err) {
        console.error(`  ❌ Error scraping ${topic.name}: ${err.message}`);
        return { skipped: false, problems: [] };
    } finally {
        await page.close();
    }
}

async function loadProgress() {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch (e) { }
    return { completedSlugs: [], problems: [] };
}

function saveProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function saveFinalCatalog(problems) {
    // Deduplicate by link
    const seen = new Set();
    const unique = problems.filter(p => {
        if (seen.has(p.link)) return false;
        seen.add(p.link);
        return true;
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(unique, null, 2));
    console.log(`\n🎉 Saved ${unique.length} unique problems to ${OUTPUT_FILE}`);
}

async function main() {
    // Ensure data directory
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    try {
        let topics = await getTopicList(browser);

        // Apply filters
        if (sectionFilter) {
            topics = topics.filter(t => t.section.toLowerCase().includes(sectionFilter.toLowerCase()));
            console.log(`  🔍 Filtered to ${topics.length} topics in section "${sectionFilter}"`);
        }

        // Load progress for resume capability
        const progress = await loadProgress();
        const remaining = topics.filter(t => !progress.completedSlugs.includes(t.slug));

        // Apply limit
        const toScrape = remaining.slice(0, Math.min(limit, remaining.length));

        console.log(`\n🚀 Scraping ${toScrape.length} topics (${progress.completedSlugs.length} already done)...\n`);

        for (let i = 0; i < toScrape.length; i++) {
            const topic = toScrape[i];
            process.stdout.write(`  [${i + 1}/${toScrape.length}] ${topic.name} (${topic.section})... `);

            const result = await scrapeTopicPage(browser, topic);

            if (result.skipped) {
                console.log(`⏭️  SKIPPED (${result.reason})`);
            } else {
                console.log(`✅ ${result.problems.length} problems (topic qualifies)`);
                progress.problems.push(...result.problems);
            }

            progress.completedSlugs.push(topic.slug);

            // Save progress every 5 topics
            if ((i + 1) % 5 === 0) {
                saveProgress(progress);
                console.log(`  💾 Progress saved (${progress.problems.length} total problems)\n`);
            }

            // Rate limit: 5s between pages
            if (i < toScrape.length - 1) {
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        // Final save
        saveProgress(progress);
        saveFinalCatalog(progress.problems);

    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
