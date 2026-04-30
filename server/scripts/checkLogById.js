const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');

async function check() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0");
    const log = await DailyLog.findById("69d9c3340f60d9dea88911ce");
    if (log) {
        console.log(`Found Log! Date: ${log.date.toISOString()} | IsSubmitted: ${log.isSubmitted} | YKW array length: ${log.youKnowWho.targetProblems.length}`);
    } else {
        console.log("Log 69d9c3340f60d9dea88911ce really not found.");
    }
    process.exit(0);
}
check();
