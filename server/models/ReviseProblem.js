const mongoose = require('mongoose');

const reviseProblemSchema = new mongoose.Schema(
  {
    problemLink: {
      type: String,
      required: [true, 'Problem link is required'],
      trim: true
    },
    dateWatchedEditorial: {
      type: Date,
      required: true,
      default: Date.now
    },
    reviseDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient sorting
reviseProblemSchema.index({ reviseDate: 1 });

module.exports = mongoose.model('ReviseProblem', reviseProblemSchema);
