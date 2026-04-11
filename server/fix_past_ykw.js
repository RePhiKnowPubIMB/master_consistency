const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const DailyLog = require('./server/models/DailyLog');
const YKWProblem = require('./server/models/YKWProblem');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/master_consistency");
    console.log("Connected to DB");
    
    const submittedLogs = await DailyLog.find({ isSubmitted: true });
    let count = 0;
    
    for (let log of submittedLogs) {
        if (log.youKnowWho && log.youKnowWho.targetProblems) {
            for (let p of log.youKnowWho.targetProblems) {
                if (p.status === 'SOLVED') {
                    if (mongoose.Types.ObjectId.isValid(p.problemId)) {
                        await YKWProblem.findByIdAndUpdate(p.problemId, { solved: true });
                        count++;
                    }
                }
            }
        }
    }
    
    console.log("Updated past solved YKW problems:", count);
    process.exit(0);
}
fix();
