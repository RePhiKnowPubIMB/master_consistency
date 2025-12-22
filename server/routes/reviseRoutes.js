const express = require('express');
const router = express.Router();
const ReviseProblem = require('../models/ReviseProblem');
const DailyLog = require('../models/DailyLog');

// @route   POST /api/revise
// @desc    Add a new problem to revision queue
router.post('/', async (req, res) => {
  try {
    const { problemLink } = req.body;

    if (!problemLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Problem link is required' 
      });
    }

    // Check if problem already exists
    const existingProblem = await ReviseProblem.findOne({ problemLink });
    if (existingProblem) {
      return res.status(400).json({ 
        success: false, 
        message: 'This problem is already in your queue' 
      });
    }

    // Calculate dates
    const dateWatchedEditorial = new Date();
    const reviseDate = new Date(dateWatchedEditorial);
    reviseDate.setDate(reviseDate.getDate() + 7);

    const problem = await ReviseProblem.create({
      problemLink,
      dateWatchedEditorial,
      reviseDate
    });

    res.status(201).json({
      success: true,
      message: 'Problem added successfully',
      data: problem
    });
  } catch (error) {
    console.error('Error adding problem:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding problem'
    });
  }
});

// @route   GET /api/revise
// @desc    Get all problems sorted by reviseDate
router.get('/', async (req, res) => {
  try {
    const problems = await ReviseProblem.find()
      .sort({ reviseDate: 1 }) // Sort by earliest revise date first
      .lean();

    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching problems'
    });
  }
});

// @route   DELETE /api/revise/pop
// @desc    Delete earliest problem and log it as revised in DailyLog
router.delete('/pop', async (req, res) => {
  try {
    // Find and delete the problem with the earliest reviseDate
    const problem = await ReviseProblem.findOneAndDelete()
      .sort({ reviseDate: 1 });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No problems in the queue'
      });
    }

    // Log this revision in today's DailyLog so heatmap updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    let log = await DailyLog.findOne({ date: today });
    
    if (log) {
        // Add to revision problems list as SOLVED
        log.revision.problems.push({
            problemId: problem._id.toString(),
            name: problem.problemLink, // Using link as name for now
            link: problem.problemLink,
            status: 'SOLVED'
        });

        // Calculate Total Due Today (Remaining in Queue due <= Today + Solved Today)
        const remainingDueCount = await ReviseProblem.countDocuments({
            reviseDate: { $lte: endOfToday }
        });
        
        log.revision.totalDue = remainingDueCount + log.revision.problems.length;
        
        // Mark revision as complete if at least one problem is solved (optional logic, can be adjusted)
        log.revision.isComplete = true;
        
        await log.save();
    }

    res.status(200).json({
      success: true,
      message: 'Problem popped and logged as revised',
      data: problem
    });
  } catch (error) {
    console.error('Error popping problem:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while popping problem'
    });
  }
});

module.exports = router;
