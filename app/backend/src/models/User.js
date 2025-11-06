const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  netId: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  wallet: {
    type: String,
    sparse: true,
    lowercase: true
  },
  walletLinkedAt: Date,
  roles: [{
    type: String,
    enum: ['student', 'organizer', 'admin', 'verifier'],
    default: 'student'
  }],
  consentFlags: {
    walletLinking: { type: Boolean, default: false },
    dataSharing: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  },
  profile: {
    avatar: String,
    bio: String,
    major: String,
    graduationYear: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: Date
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ wallet: 1 });
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });

// Virtual for full wallet info
userSchema.virtual('hasWallet').get(function() {
  return !!this.wallet;
});

// Method to check if user has role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model('User', userSchema);
