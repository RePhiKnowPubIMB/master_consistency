const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');

async function check() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0");
    const today = new Date('2026-04-11T00:00:00.000Z');
    const log = await DailyLog.findOne({ date: today });
    if (log) {
        console.log(`Found Log ID: ${log._id} | Date: ${log.date.toISOString()} | isSubmitted: ${log.isSubmitted} | targetCount: ${log.youKnowWho.targetProblems.length}`);
    } else {
        console.log("Not found in db");
    }
    process.exit(0);
}
check();
