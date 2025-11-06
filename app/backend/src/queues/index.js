const { Queue, Worker } = require('bullmq');
const { getRedisClient } = require('./config/redis');
const logger = require('./utils/logger');

// Initialize queues
const connection = {
  get client() {
    return getRedisClient();
  }
};

const mintQueue = new Queue('mint', { connection });
const pinQueue = new Queue('pin', { connection });

// Pin worker - Upload metadata to IPFS
const pinWorker = new Worker('pin', async (job) => {
  const { issuanceId, metadata, name } = job.data;
  
  logger.info(`Processing pin job for issuance ${issuanceId}`);
  
  try {
    const NFTIssuance = require('./models/NFTIssuance');
    const ipfsService = require('./services/ipfs');
    
    // Update status
    await NFTIssuance.findByIdAndUpdate(issuanceId, {
      status: 'pinning'
    });
    
    // Pin to IPFS
    const { cid, url } = await ipfsService.pinJSON(metadata, name);
    
    logger.info(`Pinned metadata to IPFS: ${cid}`);
    
    // Update issuance with CID
    const issuance = await NFTIssuance.findByIdAndUpdate(
      issuanceId,
      {
        metadataCID: cid,
        metadataURI: `ipfs://${cid}`,
        status: 'pinning'
      },
      { new: true }
    ).populate('user event badgeType');
    
    // Queue minting job
    await mintQueue.add('mint-nft', {
      issuanceId: issuance._id.toString(),
      recipient: issuance.user.wallet,
      eventId: issuance.event?._id.toString(),
      badgeType: issuance.badgeType.slug,
      metadataURI: `ipfs://${cid}`,
      contractType: issuance.contractType
    });
    
    return { cid, url };
  } catch (error) {
    logger.error(`Pin job failed for issuance ${issuanceId}:`, error);
    
    // Update status to failed
    await NFTIssuance.findByIdAndUpdate(issuanceId, {
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}, { connection });

// Mint worker - Mint NFT on blockchain
const mintWorker = new Worker('mint', async (job) => {
  const { issuanceId, recipient, eventId, badgeType, metadataURI, contractType } = job.data;
  
  logger.info(`Processing mint job for issuance ${issuanceId}`);
  
  try {
    const NFTIssuance = require('./models/NFTIssuance');
    const blockchainService = require('./services/blockchain');
    
    // Update status
    await NFTIssuance.findByIdAndUpdate(issuanceId, {
      status: 'minting'
    });
    
    // Mint NFT
    let result;
    if (contractType === 'achievement') {
      result = await blockchainService.mintAchievement(
        recipient,
        eventId,
        badgeType,
        metadataURI
      );
    } else {
      result = await blockchainService.mintCollectible(
        recipient,
        badgeType,
        metadataURI,
        1 // series
      );
    }
    
    logger.info(`Minted NFT tokenId ${result.tokenId} in tx ${result.transactionHash}`);
    
    // Update issuance with token info
    await NFTIssuance.findByIdAndUpdate(issuanceId, {
      status: 'completed',
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber
    });
    
    return result;
  } catch (error) {
    logger.error(`Mint job failed for issuance ${issuanceId}:`, error);
    
    // Update status to failed
    await NFTIssuance.findByIdAndUpdate(issuanceId, {
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}, { 
  connection,
  limiter: {
    max: 10, // Max 10 jobs
    duration: 60000 // per minute
  }
});

// Event handlers
pinWorker.on('completed', (job) => {
  logger.info(`Pin job ${job.id} completed`);
});

pinWorker.on('failed', (job, err) => {
  logger.error(`Pin job ${job?.id} failed:`, err);
});

mintWorker.on('completed', (job) => {
  logger.info(`Mint job ${job.id} completed`);
});

mintWorker.on('failed', (job, err) => {
  logger.error(`Mint job ${job?.id} failed:`, err);
});

module.exports = {
  mintQueue,
  pinQueue,
  mintWorker,
  pinWorker
};
