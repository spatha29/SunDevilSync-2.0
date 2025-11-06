const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'professional', 'social', 'other'],
    default: 'other'
  },
  capacity: Number,
  imageUrl: String,
  badgePolicy: {
    attendance: {
      enabled: { type: Boolean, default: true },
      badgeType: { type: String, default: 'attendance' },
      transferable: { type: Boolean, default: false },
      autoIssue: { type: Boolean, default: true }
    },
    winner: {
      enabled: { type: Boolean, default: false },
      badgeType: { type: String, default: 'winner' },
      transferable: { type: Boolean, default: false }
    },
    volunteer: {
      enabled: { type: Boolean, default: false },
      badgeType: { type: String, default: 'volunteer' },
      transferable: { type: Boolean, default: false }
    }
  },
  checkInConfig: {
    method: {
      type: String,
      enum: ['qr', 'gps', 'manual', 'qr+gps'],
      default: 'qr'
    },
    qrSecret: String,
    qrRotationInterval: {
      type: Number,
      default: 300 // 5 minutes in seconds
    },
    geofence: {
      enabled: { type: Boolean, default: false },
      radius: { type: Number, default: 100 }, // meters
      strictMode: { type: Boolean, default: false }
    },
    timeWindow: {
      beforeStart: { type: Number, default: 30 }, // minutes
      afterEnd: { type: Number, default: 60 }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });

// Virtual for check-in window
eventSchema.virtual('checkInWindow').get(function() {
  const beforeMs = this.checkInConfig.timeWindow.beforeStart * 60 * 1000;
  const afterMs = this.checkInConfig.timeWindow.afterEnd * 60 * 1000;
  
  return {
    start: new Date(this.startDate.getTime() - beforeMs),
    end: new Date(this.endDate.getTime() + afterMs)
  };
});

// Method to check if event is currently accepting check-ins
eventSchema.methods.isCheckInOpen = function() {
  const now = new Date();
  const window = this.checkInWindow;
  return now >= window.start && now <= window.end;
};

// Method to generate QR code data
eventSchema.methods.generateQRData = function() {
  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const rotationWindow = Math.floor(timestamp / this.checkInConfig.qrRotationInterval);
  
  const data = `${this._id}:${rotationWindow}:${this.checkInConfig.qrSecret}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  return {
    eventId: this._id.toString(),
    timestamp,
    nonce: hash.substring(0, 16),
    expiresAt: (rotationWindow + 1) * this.checkInConfig.qrRotationInterval
  };
};

module.exports = mongoose.model('Event', eventSchema);
