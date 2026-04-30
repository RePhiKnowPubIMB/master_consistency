const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');

async function check() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0");
    const logs = await DailyLog.find().sort({ date: -1 }).limit(3);
    logs.forEach(log => {
        console.log(`Date: ${log.date}, isSubmitted: ${log.isSubmitted}, YKW Length: ${log.youKnowWho.targetProblems?.length}`);
    });
    process.exit(0);
}
check();
