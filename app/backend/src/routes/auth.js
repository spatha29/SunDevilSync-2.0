const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { ethers } = require('ethers');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, netId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      netId,
      roles: ['student']
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          wallet: user.wallet
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          wallet: user.wallet
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/wallet/challenge
// @desc    Get nonce for wallet signature
// @access  Public
router.post('/wallet/challenge', [
  body('wallet').custom((value) => ethers.isAddress(value))
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { wallet } = req.body;
    const crypto = require('crypto');
    const nonce = crypto.randomBytes(32).toString('hex');

    // Store nonce in Redis with 5 minute expiration
    const { getRedisClient } = require('../config/redis');
    const redis = getRedisClient();
    await redis.setEx(`wallet:nonce:${wallet.toLowerCase()}`, 300, nonce);

    res.json({
      success: true,
      data: {
        message: `Sign this message to prove you own this wallet: ${nonce}`,
        nonce
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/wallet/verify
// @desc    Verify wallet signature and link wallet
// @access  Private
router.post('/wallet/verify', auth, [
  body('wallet').custom((value) => ethers.isAddress(value)),
  body('signature').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { wallet, signature } = req.body;
    const walletLower = wallet.toLowerCase();

    // Get nonce from Redis
    const { getRedisClient } = require('../config/redis');
    const redis = getRedisClient();
    const nonce = await redis.get(`wallet:nonce:${walletLower}`);

    if (!nonce) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired nonce'
      });
    }

    // Verify signature
    const message = `Sign this message to prove you own this wallet: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletLower) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if wallet is already linked to another user
    const existingUser = await User.findOne({ wallet: walletLower });
    if (existingUser && existingUser._id.toString() !== req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Wallet is already linked to another account'
      });
    }

    // Link wallet to user
    req.user.wallet = walletLower;
    req.user.walletLinkedAt = new Date();
    req.user.consentFlags.walletLinking = true;
    await req.user.save();

    // Delete nonce
    await redis.del(`wallet:nonce:${walletLower}`);

    res.json({
      success: true,
      data: {
        wallet: req.user.wallet,
        linkedAt: req.user.walletLinkedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          netId: req.user.netId,
          wallet: req.user.wallet,
          roles: req.user.roles,
          profile: req.user.profile,
          consentFlags: req.user.consentFlags
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
