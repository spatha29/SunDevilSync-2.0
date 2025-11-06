const mongoose = require('mongoose');

const nftIssuanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  badgeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BadgeType',
    required: true
  },
  contractType: {
    type: String,
    enum: ['achievement', 'collectible'],
    required: true
  },
  tokenId: String,
  metadataCID: String,
  metadataURI: String,
  metadataHash: String,
  status: {
    type: String,
    enum: ['pending', 'pinning', 'minting', 'completed', 'failed'],
    default: 'pending'
  },
  transactionHash: String,
  blockNumber: Number,
  error: String,
  series: Number,
  // Off-chain data (not exposed publicly)
  privateData: {
    studentName: String,
    studentEmail: String,
    deviceFingerprint: String,
    checkinTimestamp: Date
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revocationReason: String
}, {
  timestamps: true
});

// Indexes
nftIssuanceSchema.index({ user: 1, event: 1, badgeType: 1 });
nftIssuanceSchema.index({ tokenId: 1 }, { sparse: true });
nftIssuanceSchema.index({ status: 1 });
nftIssuanceSchema.index({ transactionHash: 1 }, { sparse: true });
nftIssuanceSchema.index({ metadataCID: 1 }, { sparse: true });

// Prevent duplicate issuance
nftIssuanceSchema.index(
  { user: 1, event: 1, badgeType: 1 },
  { unique: true, partialFilterExpression: { event: { $exists: true } } }
);

module.exports = mongoose.model('NFTIssuance', nftIssuanceSchema);
