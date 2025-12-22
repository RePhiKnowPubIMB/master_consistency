const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, index: true, default: Date.now }, 
  isRestDay: { type: Boolean, default: false },
  
  codeforces: {
    targetProblems: [
      { 
        problemId: String, 
        name: String, 
        link: String, 
        status: { type: String, enum: ['PENDING', 'SOLVED'], default: 'PENDING' }
      } 
    ],
    solvedCount: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false }
  },
  
  leetcode: {
    link: String,
    status: { type: String, enum: ['PENDING', 'SOLVED'], default: 'PENDING' }
  },
  
  revision: {
    problems: [
        { 
            problemId: String, 
            name: String, 
            link: String, 
            status: { type: String, enum: ['PENDING', 'SOLVED'], default: 'PENDING' }
        }
    ], 
    totalDue: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false }
  },

  prayers: {
    fajr: { type: Boolean, default: false },
    dhuhr: { type: Boolean, default: false },
    asr: { type: Boolean, default: false },
    maghrib: { type: Boolean, default: false },
    isha: { type: Boolean, default: false },
    count: { type: Number, default: 0 }
  },

  academic: {
    todoList: [{ task: String, isDone: { type: Boolean, default: false } }],
    hoursTarget: { type: Number, default: 3 },
    hoursDone: { type: Number, default: 0 }
  },

  // New fields for daily submission
  comment: { type: String, default: '' },
  isSubmitted: { type: Boolean, default: false },
  consistencyScore: { type: Number, default: 0 }, // Explicitly storing the score

  kaggle: {
    todoList: [{ task: String, isDone: { type: Boolean, default: false } }],
    targetMinutes: { type: Number, default: 60 },
    minutesDone: { type: Number, default: 0 }
  },

  workout: {
    required: { type: Boolean, default: true },
    level: Number,
    targets: {
      pushups: Number,
      situps: Number,
      squats: Number,
      running: Number,
      deadlift: Number,
      biceps: Number
    },
    checklist: {
        pushups: { type: Boolean, default: false },
        situps: { type: Boolean, default: false },
        squats: { type: Boolean, default: false },
        biceps: { type: Boolean, default: false },
        deadlift: { type: Boolean, default: false },
        running: { type: Boolean, default: false }
    },
    isCompleted: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);
