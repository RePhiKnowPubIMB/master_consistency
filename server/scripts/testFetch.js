const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');
const YKWProblem = require('../models/YKWProblem');

async function test() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0");
    const today = new Date('2026-04-11T00:00:00.000Z');
    let log = await DailyLog.findOne({ date: today });
    if (!log) {
        console.log("No log for 11th found in DB manually."); 
        process.exit();
    }
    console.log("Log 11th:", log.youKnowWho);
    
    // Let's run the exact same code the backend is running
    let unsolved = await YKWProblem.find({
        solved: false
    }).sort({ globalOrder: 1 }).limit(5);

    console.log("Found unsolved problems in db:", unsolved.length);
    if(unsolved.length > 0) {
        log.youKnowWho.targetProblems = unsolved.map(p => ({
            problemId: p._id.toString(),
            name: p.title.replace(/^\d+\.\s*/, '').trim(),
            link: p.url,
            topic: p.topicName,
            difficulty: p.difficulty,
            status: 'PENDING'
        }));
        log.youKnowWho.isComplete = false;
        log.markModified('youKnowWho');
        await log.save();
        console.log("Saved properly!");
    } else {
        console.log("unsolved length is 0");
    }
    process.exit();
}
test();
