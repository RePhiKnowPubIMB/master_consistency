const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = 'https://youkn0wwho.academy/topic-list/mixed_practice?topics=mos_algorithm,all_subarray_maximum_minimum,hld,dynamic_connectivity_problem,dsu_on_tree,segment_tree,gp_hash_table,dsu,divide_and_conquer_on_queries,offline_queries,segment_tree_with_lazy_propagation,centroid_decomposition,persistent_segment_tree,treap,ordered_set,wavelet_tree';

async function run() {
    console.log('🚀 Starting browser...');
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    console.log('🌐 Navigating to URL (this may take a minute)...');
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (e) {
        console.log('⚠️ Navigation timeout or error, proceeding to wait for content regardless...');
    }

    // Wait for the table to appear (Firestore loading)
    console.log('⏳ Waiting for problem table to load...');
    try {
        await page.waitForSelector('table.chakra-table tbody tr td a', { timeout: 60000 });
        console.log('✅ Found elements.');
    } catch(e) {
        console.log('⚠️ Timeout waiting for elements. Checking body text...');
        const body = await page.evaluate(() => document.body.innerText.length);
        console.log('Body length:', body);
    }
    
    // Scroll down multiple times to load lazy-loaded elements
    console.log('📜 Scrolling to load more problems...');
    for (let i = 0; i < 60; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, 1500);
            return document.body.scrollHeight;
        });
        // Wait for potential content loading
        await new Promise(r => setTimeout(r, 1000));
        
        // Log progress periodically
        if(i % 10 === 0) {
            const count = await page.evaluate(() => document.querySelectorAll('table.chakra-table tbody tr').length);
            console.log(`  Loaded approximately ${count} rows...`);
        }
    }
    
    // Additional long wait to ensure all elements are rendered (Chakra UI / Firestore)
    await new Promise(r => setTimeout(r, 15000));

    console.log('🔍 Scraping problems from 364 rows...');
    const problems = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.chakra-table tbody tr'));
        
        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            if(cells.length < 3) return null;
            
            const link = row.querySelector('a');
            const badge = row.querySelector('span.chakra-badge');
            
            return {
                serial: cells[0].textContent.trim(),
                title: link ? link.textContent.trim() : 'NO_TITLE',
                url: link ? link.href : 'NO_URL',
                difficulty: badge ? badge.textContent.trim() : 'UNKNOWN'
            };
        }).filter(p => p !== null);
    });

    console.log(`✅ Found ${problems.length} total rows/problems.`);
    
    const outputPath = path.join(__dirname, '..', 'data', 'mixed-practice-problems.json');
    fs.writeFileSync(outputPath, JSON.stringify(problems, null, 2));
    console.log(`💾 Saved to ${outputPath}`);

    await browser.close();
}

run().catch(err => {
    console.error('❌ FATAL:', err);
    process.exit(1);
});
