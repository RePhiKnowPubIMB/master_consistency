const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/all-topic-problems.json');
const outputPath = path.join(__dirname, '../data/all-topic-problems-cleaned.json');

const excludeTitles = ['tutorial', 'editorial', 'lesson', 'blog'];

function cleanup() {
    if (!fs.existsSync(inputPath)) {
        console.error('Input file not found:', inputPath);
        return;
    }

    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const cleanedData = {};

    let totalOriginal = 0;
    let totalCleaned = 0;

    for (const [topic, problems] of Object.entries(data)) {
        totalOriginal += problems.length;

        const filtered = problems.filter(p => {
            // Keep if difficulty is not UNKNOWN
            const hasDifficulty = p.difficulty && p.difficulty !== 'UNKNOWN' && p.difficulty !== '';
            
            // Check for tutorial keywords in title
            const isTutorial = excludeTitles.some(keyword => 
                p.title.toLowerCase().includes(keyword.toLowerCase())
            );

            // Keep only if it HAS a difficulty AND is NOT a tutorial/editorial
            return hasDifficulty && !isTutorial;
        });

        if (filtered.length > 0) {
            cleanedData[topic] = filtered;
            totalCleaned += filtered.length;
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2));
    
    console.log(`Cleanup complete!`);
    console.log(`Original total items: ${totalOriginal}`);
    console.log(`Cleaned total items: ${totalCleaned}`);
    console.log(`Removed ${totalOriginal - totalCleaned} items.`);
    console.log(`Output saved to: ${outputPath}`);
}

cleanup();
