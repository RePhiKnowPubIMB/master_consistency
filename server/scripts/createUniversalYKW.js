const fs = require('fs');
const mongoose = require('mongoose');

const YKWProblem = require('../models/YKWProblem');

// Load original data
const rawData = JSON.parse(fs.readFileSync('../data/all-topic-problems.json', 'utf8'));

const topics = Object.keys(rawData);
console.log(`Found ${topics.length} topics in the JSON.`);

// Build interleaved list
const interleaved = [];
const topicPointers = {};
topics.forEach(t => topicPointers[t] = 0);

const seenUrls = new Set();

let moreProblemsAvailable = true;

while (moreProblemsAvailable) {
    moreProblemsAvailable = false;
    
    for (const topic of topics) {
        let addedInThisRound = 0;
        const problemList = rawData[topic];
        let ptr = topicPointers[topic];
        
        while (addedInThisRound < 5 && ptr < problemList.length) {
            const url = problemList[ptr].url || problemList[ptr].link;
            
            if (seenUrls.has(url)) {
              // skip duplicates entirely
              ptr++;
              continue;
            }
            seenUrls.add(url);
            
            interleaved.push({
                topicName: topic,
                title: problemList[ptr].title || problemList[ptr].name,
                url: url,
                difficulty: problemList[ptr].difficulty || "Unspecified",
                solved: false,
                globalOrder: interleaved.length + 1
            });
            ptr++;
            addedInThisRound++;
            moreProblemsAvailable = true;
        }
        topicPointers[topic] = ptr;
    }
}

console.log(`Created interleaved list of ${interleaved.length} unique problems.`);
fs.writeFileSync('../data/universal-ykw.json', JSON.stringify(interleaved, null, 2));

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        console.log("Emptying old YKW Problems collection...");
        await YKWProblem.deleteMany({});
        
        console.log("Inserting new universal interleaved problems...");
        for (let i = 0; i < interleaved.length; i += 100) {
            const batch = interleaved.slice(i, i + 100);
            await YKWProblem.insertMany(batch);
            console.log(`Inserted ${i + Math.min(batch.length, 100)}/${interleaved.length}`);
        }
        
        console.log("Done!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedDB();
