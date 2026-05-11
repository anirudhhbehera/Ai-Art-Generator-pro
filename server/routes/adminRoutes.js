const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Art = require('../models/Art');
const { adminAuth } = require('../middleware/auth');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArt = await Art.countDocuments();
    const totalLikes = await Art.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]);
    const totalComments = await Art.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
    ]);

    res.json({
      totalUsers,
      totalArt,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Ban/Unban user
router.patch('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = user.role === 'banned' ? 'user' : 'banned';
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;