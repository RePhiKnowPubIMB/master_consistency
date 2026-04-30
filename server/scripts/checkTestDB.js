const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');

async function test() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/test?appName=Cluster0");
    const log = await DailyLog.findById("69d9c3340f60d9dea88911ce");
    if (log) {
        console.log("FOUND IN TEST DB!!!!");
    } else {
        console.log("Not in test DB either.");
    }
    process.exit();
}
test();
