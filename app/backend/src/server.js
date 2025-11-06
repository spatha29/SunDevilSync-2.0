require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const walletRoutes = require('./routes/wallets');
const nftRoutes = require('./routes/nfts');
const verifyRoutes = require('./routes/verify');
const adminRoutes = require('./routes/admin');

// Import queues
const { mintQueue, pinQueue } = require('./queues');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Bull Board for queue monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  
  createBullBoard({
    queues: [
      new BullMQAdapter(mintQueue),
      new BullMQAdapter(pinQueue)
    ],
    serverAdapter
  });
  
  app.use('/admin/queues', serverAdapter.getRouter());
}

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/events`, eventRoutes);
app.use(`${apiPrefix}/wallets`, walletRoutes);
app.use(`${apiPrefix}/nfts`, nftRoutes);
app.use(`${apiPrefix}/verify`, verifyRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    await mintQueue.close();
    await pinQueue.close();
    logger.info('Queues closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to Redis
    await connectRedis();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}${apiPrefix}`);
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Queue dashboard at http://localhost:${PORT}/admin/queues`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
