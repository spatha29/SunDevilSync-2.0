const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Event = require('../models/Event');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// @route   GET /api/v1/events
// @desc    Get all events (with filters)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { status, category, upcoming, limit = 20, page = 1 } = req.query;
    
    const query = { isPublic: true };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/events
// @desc    Create new event
// @access  Private (Organizer/Admin)
router.post('/', auth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.userId
    });
    
    // Generate QR secret
    const crypto = require('crypto');
    event.checkInConfig.qrSecret = crypto.randomBytes(32).toString('hex');
    
    await event.save();
    
    res.status(201).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/events/:id/enroll
// @desc    Enroll in event
// @access  Private
router.post('/:id/enroll', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.userId,
      event: event._id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this event'
      });
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      user: req.userId,
      event: event._id,
      state: 'enrolled'
    });
    
    await enrollment.save();
    
    // Update event enrollment count
    event.enrollmentCount += 1;
    await event.save();
    
    res.status(201).json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/events/:id/checkin
// @desc    Check-in to event
// @access  Private
router.post('/:id/checkin', auth, async (req, res, next) => {
  try {
    const { qrNonce, gpsCoordinates } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if check-in window is open
    if (!event.isCheckInOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in window is not currently open'
      });
    }
    
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      user: req.userId,
      event: event._id
    });
    
    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You must enroll before checking in'
      });
    }
    
    if (enrollment.state === 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in'
      });
    }
    
    // TODO: Validate QR nonce and GPS if required
    
    // Mark as checked in
    await enrollment.checkIn(event.checkInConfig.method, {
      qrNonce,
      gpsCoordinates,
      timestamp: new Date(),
      ipAddress: req.ip
    });
    
    // Queue NFT minting if auto-issue enabled
    if (event.badgePolicy.attendance.enabled && event.badgePolicy.attendance.autoIssue) {
      const { pinQueue } = require('../queues');
      const BadgeType = require('../models/BadgeType');
      const NFTIssuance = require('../models/NFTIssuance');
      const ipfsService = require('../services/ipfs');
      
      const badgeType = await BadgeType.findOne({ slug: event.badgePolicy.attendance.badgeType });
      
      if (badgeType) {
        const issuance = new NFTIssuance({
          user: req.userId,
          event: event._id,
          badgeType: badgeType._id,
          contractType: badgeType.contractType,
          status: 'pending'
        });
        
        await issuance.save();
        
        // Build metadata
        const metadata = ipfsService.buildMetadataJSON(
          {
            id: event._id.toString(),
            name: event.name,
            date: event.startDate,
            venue: event.venue?.name
          },
          {
            type: badgeType.name,
            description: badgeType.description,
            imageCID: badgeType.design.imageCID,
            transferable: badgeType.policy.transferable,
            issuer: 'SunDevilSync 2.0'
          },
          {
            tokenId: null
          }
        );
        
        // Queue pin job
        await pinQueue.add('pin-metadata', {
          issuanceId: issuance._id.toString(),
          metadata,
          name: `${event.name}-${badgeType.name}-${req.user.name}`
        });
      }
    }
    
    res.json({
      success: true,
      data: { enrollment },
      message: 'Successfully checked in!'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
