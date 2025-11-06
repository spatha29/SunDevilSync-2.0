const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  state: {
    type: String,
    enum: ['enrolled', 'checked-in', 'attended', 'no-show', 'cancelled'],
    default: 'enrolled'
  },
  checkinAt: Date,
  checkinMethod: {
    type: String,
    enum: ['qr', 'gps', 'manual', 'qr+gps']
  },
  checkinProof: {
    deviceHash: String,
    ipAddress: String,
    gpsCoordinates: {
      lat: Number,
      lng: Number,
      accuracy: Number
    },
    qrNonce: String,
    timestamp: Date
  },
  badgesIssued: [{
    type: {
      type: String,
      enum: ['attendance', 'winner', 'volunteer', 'collectible']
    },
    issuedAt: Date,
    nftIssuanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NFTIssuance'
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Compound index to ensure one enrollment per user per event
enrollmentSchema.index({ user: 1, event: 1 }, { unique: true });
enrollmentSchema.index({ event: 1, state: 1 });
enrollmentSchema.index({ user: 1, state: 1 });

// Method to mark as checked in
enrollmentSchema.methods.checkIn = function(method, proof) {
  this.state = 'checked-in';
  this.checkinAt = new Date();
  this.checkinMethod = method;
  this.checkinProof = proof;
  return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
