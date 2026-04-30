const mongoose = require('mongoose');
const YKWProblem = require('../models/YKWProblem');

async function test() {
    await mongoose.connect("mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/test?appName=Cluster0");
    const count = await YKWProblem.countDocuments();
    console.log("Count in test DB:", count);
    process.exit();
}
test();
