const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const ReviseProblem = require('./server/models/ReviseProblem');

async function update() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/master_consistency");
    console.log("Connected to DB");
    const problems = await ReviseProblem.find({});
    for (let p of problems) {
        if (!p.isRevised) {
            // set revisedDate to 20 days after dateWatchedEditorial
            const newReviseDate = new Date(p.dateWatchedEditorial);
            newReviseDate.setDate(newReviseDate.getDate() + 20);
            p.reviseDate = newReviseDate;
            await p.save();
        }
    }
    console.log("Updated problems", problems.length);
    process.exit(0);
}
update();
