const mongoose = require('mongoose');

const ykwProblemSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true,
      unique: true
    },
    difficulty: {
      type: String
    },
    tags: [String],
    solved: {
      type: Boolean,
      default: false
    },
    solveDate: {
      type: Date
    },
    dailyIndex: {
      type: Number // To track position in the topic (1-5 etc.)
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('YKWProblem', ykwProblemSchema);
