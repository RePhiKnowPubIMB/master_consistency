const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initCron } = require('./services/cronService');
const { seedQuotes } = require('./services/quoteService');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviseRoutes = require('./routes/reviseRoutes');
const UserConfig = require('./models/UserConfig');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/consistency-architect')
    .then(async () => {
        console.log('MongoDB Connected');
        await seedQuotes();

        // Migration: Update cycleDays to 20
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
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/revise', reviseRoutes);

// Start Cron
initCron();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
