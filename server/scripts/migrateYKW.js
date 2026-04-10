const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const YKWProblem = require('../models/YKWProblem');

const DB_URI = "mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0";
const JSON_FILE = path.join(__dirname, '../data/all-topic-problems.json');

async function migrate() {
    try {
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
        let count = 0;

        for (const [topicName, problems] of Object.entries(data)) {
            for (let i = 0; i < problems.length; i++) {
                const p = problems[i];
                try {
                    await YKWProblem.findOneAndUpdate(
                        { url: p.url },
                        {
                            topicName,
                            title: p.title,
                            url: p.url,
                            difficulty: p.difficulty,
                            tags: p.tags,
                            dailyIndex: i + 1 // Maintain original library ordering
                        },
                        { upsert: true, new: true }
                    );
                    count++;
                } catch (e) {
                    console.error(`Failed to migrate ${p.url}: ${e.message}`);
                }
            }
        }

        console.log(`✅ Successfully migrated ${count} problems from JSON to MongoDB.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
