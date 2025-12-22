const mongoose = require('mongoose');

const userConfigSchema = new mongoose.Schema({
  username: { type: String, default: "RePhiKnowPubIMB" },
  codeforces: {
    currentRating: { type: Number, default: 1700 },
    solvedCount: { type: Number, default: 0 }
  },
  academic: {
    tomorrowTasks: [{ task: String, isDone: { type: Boolean, default: false } }]
  },
  kaggle: {
    tomorrowTasks: [{ task: String, isDone: { type: Boolean, default: false } }]
  },
  badges: [
    {
      id: String,
      name: String,
      description: String,
      icon: String, // lucide icon name
      category: String, // prayer, workout, coding, academic, kaggle, overall
      tier: String, // bronze (20), silver (50), gold (100), platinum (200), diamond (365)
      dateEarned: { type: Date, default: Date.now }
    }
  ],
  workout: {
    startDate: { type: Date, default: Date.now },
    cycleDays: { type: Number, default: 21 },
    baseStats: { 
      pushups: { type: Number, default: 20 }, 
      situps: { type: Number, default: 20 }, 
      squats: { type: Number, default: 20 }, 
      running: { type: Number, default: 40 }, 
      deadlift: { type: Number, default: 0 }, 
      biceps: { type: Number, default: 0 } 
    },
    increment: { 
      pushups: { type: Number, default: 5 }, 
      situps: { type: Number, default: 5 }, 
      squats: { type: Number, default: 5 }, 
      running: { type: Number, default: 5 }, 
      deadlift: { type: Number, default: 5 }, 
      biceps: { type: Number, default: 2 } 
    },
    maxStats: {
        pushups: { type: Number, default: 100 }, 
        situps: { type: Number, default: 100 }, 
        squats: { type: Number, default: 100 }, 
        running: { type: Number, default: 60 }, 
        deadlift: { type: Number, default: 50 }, 
        biceps: { type: Number, default: 100 }
    }
  }
});

module.exports = mongoose.model('UserConfig', userConfigSchema);
