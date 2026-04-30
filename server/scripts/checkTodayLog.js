const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');

async function check() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/consistency-architect?appName=Cluster0");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const log = await DailyLog.findOne({ date: today });
    if(log) {
        console.log(JSON.stringify(log.youKnowWho, null, 2));
    } else {
        console.log("No log for today");
    }
    process.exit(0);
}
check();
