const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/routes - Get user's last 3 routes
router.get('/routes', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      routes: user.routeHistory,
      count: user.routeHistory.length
    });

  } catch (error) {
    console.error('❌ Error fetching routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route history'
    });
  }
});

// POST /api/user/routes - Save a new route to history
router.post('/routes', verifyToken, async (req, res) => {
  try {
    const { from, to, mode, distance, duration } = req.body;
    
    console.log('📝 Route save request:', { from, to, mode, distance, duration });

    // Validate required fields
    if (!from || !to || !mode || distance === undefined || distance === null) {
      console.error('❌ Validation failed:', { from, to, mode, distance });
      return res.status(400).json({
        success: false,
        error: 'Missing required route data (from, to, mode, distance)',
        received: { from, to, mode, distance, duration }
      });
    }
    
    // Ensure distance is a number (allow 0 for very short routes or calculation issues)
    if (typeof distance !== 'number' || distance < 0) {
      console.error('❌ Invalid distance:', distance, 'type:', typeof distance);
      return res.status(400).json({
        success: false,
        error: 'Distance must be a non-negative number',
        received: { distance, type: typeof distance }
      });
    }
    
    // Warn if distance is 0 but still allow it
    if (distance === 0) {
      console.warn('⚠️ Distance is 0 - route may not have been calculated properly')
    }

    // Validate mode
    if (!['fuel', 'optimal', 'safe'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mode. Must be fuel, optimal, or safe'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add route to history (FIFO, max 3)
    await user.addRoute({
      from,
      to,
      mode,
      distance,
      duration: duration || null
    });

    res.json({
      success: true,
      message: 'Route saved to history',
      routeHistory: user.routeHistory
    });

  } catch (error) {
    console.error('❌ Error saving route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save route'
    });
  }
});

// GET /api/user/profile - Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        routeHistory: user.routeHistory,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// DELETE /api/user/routes/:index - Delete a route from history by index
router.delete('/routes/:index', verifyToken, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    if (isNaN(index) || index < 0 || index > 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route index (0-2)'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (index >= user.routeHistory.length) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Remove route at index
    user.routeHistory.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Route deleted',
      routeHistory: user.routeHistory
    });

  } catch (error) {
    console.error('❌ Error deleting route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete route'
    });
  }
});

module.exports = router;
