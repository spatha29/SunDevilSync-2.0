const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Event = require('../models/Event');
const NFTIssuance = require('../models/NFTIssuance');
const BadgeType = require('../models/BadgeType');
const User = require('../models/User');
const blockchainService = require('../services/blockchain');

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireRole('admin'));

// @route   GET /api/v1/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalNFTs, activeEvents] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      NFTIssuance.countDocuments({ status: 'completed' }),
      Event.countDocuments({ status: 'ongoing' })
    ]);
    
    const minterBalance = await blockchainService.getMinterBalance();
    
    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalNFTs,
          activeEvents,
          minterBalance
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/admin/badge-types
// @desc    Create badge type
// @access  Admin
router.post('/badge-types', async (req, res, next) => {
  try {
    const badgeType = new BadgeType(req.body);
    await badgeType.save();
    
    res.status(201).json({
      success: true,
      data: { badgeType }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/admin/revoke/:tokenId
// @desc    Revoke an NFT
// @access  Admin
router.post('/revoke/:tokenId', async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const { reason } = req.body;
    
    const issuance = await NFTIssuance.findOne({ tokenId });
    
    if (!issuance) {
      return res.status(404).json({
        success: false,
        message: 'NFT not found'
      });
    }
    
    // Revoke on-chain
    await blockchainService.revokeAchievement(tokenId, reason);
    
    // Update database
    issuance.isRevoked = true;
    issuance.revokedAt = new Date();
    issuance.revokedBy = req.userId;
    issuance.revocationReason = reason;
    await issuance.save();
    
    res.json({
      success: true,
      message: 'NFT revoked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/admin/audit
// @desc    Get audit logs
// @access  Admin
router.get('/audit', async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    // TODO: Implement proper audit log model
    // For now, return recent NFT issuances
    const logs = await NFTIssuance.find()
      .populate('user', 'name email')
      .populate('event', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
