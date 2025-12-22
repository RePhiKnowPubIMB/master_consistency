import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    problemLink: {
      type: String,
      required: [true, 'Problem link is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // Validate Codeforces link format - more flexible
          return /^https?:\/\/(www\.)?codeforces\.com\/(problemset\/problem|contest)\/\d+\/(problem\/)?[A-Z]\d*/.test(v) ||
                 /^https?:\/\/(www\.)?codeforces\.com\/gym\/\d+\/problem\/[A-Z]\d*/.test(v);
        },
        message: 'Please provide a valid Codeforces problem link'
      }
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
problemSchema.index({ reviseDate: 1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
