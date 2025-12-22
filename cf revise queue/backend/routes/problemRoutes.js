import express from 'express';
import Problem from '../models/problemModel.js';

const router = express.Router();

// @route   POST /api/problems
// @desc    Add a new problem
// @access  Public
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
    const existingProblem = await Problem.findOne({ problemLink });
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

    const problem = await Problem.create({
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
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error adding problem:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding problem'
    });
  }
});

// @route   GET /api/problems
// @desc    Get all problems sorted by reviseDate
// @access  Public
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find()
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

// @route   DELETE /api/problems/pop
// @desc    Delete and return the problem with earliest reviseDate
// @access  Public
router.delete('/pop', async (req, res) => {
  try {
    // Find and delete the problem with the earliest reviseDate
    const problem = await Problem.findOneAndDelete()
      .sort({ reviseDate: 1 });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No problems in the queue'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem popped successfully',
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

// @route   DELETE /api/problems/:id
// @desc    Delete a specific problem by ID
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
      data: problem
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting problem'
    });
  }
});

export default router;
