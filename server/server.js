const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initCron } = require('./services/cronService');
const { seedQuotes } = require('./services/quoteService');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviseRoutes = require('./routes/reviseRoutes');
const UserConfig = require('./models/UserConfig');

// Set Puppeteer to use system Chrome
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Migration Logic moved inside connectDB
const runMigrations = async () => {
    try {
        const config = await UserConfig.findOne();
        if (config && config.workout && config.workout.cycleDays === 21) {
            config.workout.cycleDays = 20;
            await config.save();
            console.log('Updated workout cycleDays to 20');
        }
    } catch (err) {
        console.error('Migration Error:', err);
    }
};

// Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
        await seedQuotes();
        await runMigrations();
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/revise', reviseRoutes);

// Start Cron (Local only, Vercel uses vercel.json crons)
if (!process.env.VERCEL) {
    connectDB().then(() => {
        initCron();
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} else {
    // For Vercel, we connect on each request or use a middleware
    app.use(async (req, res, next) => {
        await connectDB();
        next();
    });
}

module.exports = app;
