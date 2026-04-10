const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://youkn0wwho.academy/topic-list/';
const TOPICS = [
    { name: 'Segment Tree (Point Update Range Query)', slug: 'segment_tree' },
    { name: 'Segment Tree with Lazy Propagation', slug: 'segment_tree_with_lazy_propagation' },
    { name: 'BIT / Fenwick Tree', slug: 'bit' },
    { name: 'Sparse Table', slug: 'sparse_table' },
    { name: 'DSU', slug: 'dsu' },
    { name: 'Trie', slug: 'trie' },
    { name: 'SQRT Decomposition', slug: 'sqrt_decomposition' },
    { name: 'Splitting Objects into Light and Heavy', slug: 'splitting_objects_into_light_and_heavy' },
    { name: 'Mo\'s Algorithm', slug: 'mos_algorithm' },
    { name: 'BST', slug: 'bst' },
    { name: 'Ordered Set', slug: 'ordered_set' },
    { name: 'GP Hash Table', slug: 'gp_hash_table' },
    { name: 'All Subarray Maximum Minimum', slug: 'all_subarray_maximum_minimum' },
    { name: 'Monotonous Queue', slug: 'monotonous_queue' },
    { name: 'Persistent Segment Tree', slug: 'persistent_segment_tree' },
    { name: 'DSU on Tree', slug: 'dsu_on_tree' },
    { name: 'HLD', slug: 'hld' },
    { name: 'Centroid Decomposition', slug: 'centroid_decomposition' },
    { name: 'Treap', slug: 'treap' },
    { name: 'Implicit Treap', slug: 'implicit_treap' },
    { name: 'Offline Queries', slug: 'offline_queries' },
    { name: 'Divide and Conquer on Queries', slug: 'divide_and_conquer_on_queries' },
    { name: 'Mobius Function', slug: 'mobius_function' },
    { name: 'XOR Hashing', slug: 'xor_hashing' },
    { name: 'Suffix Array', slug: 'suffix_array' },
    { name: 'Suffix Automaton', slug: 'suffix_automaton' },
    { name: 'Euler Tour Technique', slug: 'euler_tour_technique' },
    { name: 'Binary Lifting and LCA', slug: 'binary_lifting_and_lca' },
    { name: 'SCC', slug: 'scc' },
    { name: 'MST', slug: 'mst' },
    { name: 'CRT', slug: 'crt' },
    { name: 'Inclusion and Exclusion on Multiples', slug: 'inclusion_and_exclusion_on_multiples' },
    { name: 'Matrix Exponentiation', slug: 'matrix_exponentiation' },
    { name: 'Probabilities and Expected Values', slug: 'probabilities_and_expected_values' },
    { name: 'Z-Algorithm', slug: 'z_algorithm' },
    { name: 'LCS', slug: 'lcs' },
    { name: 'DP on Trees and DAGs', slug: 'dp_on_trees_and_dags' },
    { name: 'LIS', slug: 'lis' },
    { name: 'Grundy Number', slug: 'grundy_number' },
    { name: 'Inversions', slug: 'inversions' },
    { name: 'FFT', slug: 'fft' },
    { name: 'Digit DP', slug: 'digit_dp' },
    { name: 'Convex Hull 2D', slug: 'convex_hull_2d' },
    { name: 'Euclidean Geometry', slug: 'euclidean_geometry' },
    { name: 'Sweep Line Algorithm', slug: 'sweep_line_algorithm' },
    { name: 'Meet in the Middle', slug: 'meet_in_the_middle' },
];

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'all-topic-problems.json');

async function scrapeTopic(browser, topic) {
    console.log(`📂 Scraping Topic: ${topic.name}...`);
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    const url = `${BASE_URL}${topic.slug}`;
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (e) {
        console.log(`  ⚠️ Navigation timeout for ${topic.name}, continuing...`);
    }

    await new Promise(r => setTimeout(r, 10000));

    // Scroll
    for (let i = 0; i < 15; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 400));
    }

    // Reveal tags
    await page.evaluate(async () => {
        const buttons = document.querySelectorAll('button.chakra-accordion__button');
        for (const btn of buttons) {
            if (btn.getAttribute('aria-expanded') !== 'true') {
                btn.click();
                await new Promise(r => setTimeout(r, 50));
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 5000));

    const problems = await page.evaluate(() => {
        const rows = document.querySelectorAll('table.chakra-table tbody tr');
        let currentProblem = null;
        const results = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const link = row.querySelector('a.chakra-link');
                const badge = row.querySelector('span.chakra-badge');
                let serialRaw = cells[0].textContent.trim();
                let serialMatch = serialRaw.match(/\d+/);
                let serial = serialMatch ? serialMatch[0] : '';

                currentProblem = {
                    serial: serial,
                    title: link ? link.textContent.trim() : '',
                    url: link ? link.href : '',
                    difficulty: badge ? badge.textContent.trim() : 'UNKNOWN',
                    tags: []
                };
                if (currentProblem.title && currentProblem.url) results.push(currentProblem);
            } else if (currentProblem) {
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

    // We no longer strictly filter out tutorials. We keep everything that has a title and URL.
    const finalProblems = problems.filter(p => p.title && p.url);

    console.log(`  ✅ Found ${finalProblems.length} items (including tutorials/problems).`);
    await page.close();
    return finalProblems;
}

async function run() {
// ...existing code...
    const masterData = {};

    for (const topic of TOPICS) {
        masterData[topic.name] = await scrapeTopic(browser, topic);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterData, null, 2));
    console.log(`
🎉 Consolidated data saved to ${OUTPUT_FILE}`);

    await browser.close();
}

run().catch(console.error);

async function run() {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Load existing data if it exists
    let masterData = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            masterData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            console.log(`📦 Loaded existing data for ${Object.keys(masterData).length} topics.`);
        } catch (e) {
            console.log('⚠️ Could not parse existing data, starting fresh.');
        }
    }

    for (const topic of TOPICS) {
        // Skip if topic already has data (to allow resume/incremental)
        if (masterData[topic.name] && masterData[topic.name].length > 0) {
            console.log(`⏭️ Skipping ${topic.name} (already has ${masterData[topic.name].length} items).`);
            continue;
        }

        masterData[topic.name] = await scrapeTopic(browser, topic);
        // Save after each topic to prevent losing progress
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterData, null, 2));
    }

    console.log(`\n🎉 All topics processed. Final data in ${OUTPUT_FILE}`);

    await browser.close();
}

run().catch(console.error);
