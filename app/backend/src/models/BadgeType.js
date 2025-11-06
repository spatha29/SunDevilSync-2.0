const mongoose = require('mongoose');

const badgeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category: {
    type: String,
    enum: ['attendance', 'achievement', 'participation', 'collectible'],
    required: true
  },
  policy: {
    transferable: {
      type: Boolean,
      default: false
    },
    scarcity: {
      limited: { type: Boolean, default: false },
      maxSupply: Number
    },
    batchable: {
      type: Boolean,
      default: true
    },
    expiry: {
      enabled: { type: Boolean, default: false },
      duration: Number // days
    },
    revocable: {
      type: Boolean,
      default: true
    }
  },
  design: {
    imageTemplate: String,
    imageCID: String,
    backgroundColor: String,
    textColor: String,
    icon: String
  },
  attributesSchema: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  contractType: {
    type: String,
    enum: ['achievement', 'collectible'],
    default: 'achievement'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
badgeTypeSchema.index({ slug: 1 });
badgeTypeSchema.index({ category: 1 });
badgeTypeSchema.index({ isActive: 1 });

module.exports = mongoose.model('BadgeType', badgeTypeSchema);
