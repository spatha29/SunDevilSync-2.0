const express = require('express');
const NFTIssuance = require('../models/NFTIssuance');
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');

const router = express.Router();

// @route   GET /api/v1/nfts/:tokenId
// @desc    Get NFT details
// @access  Public
router.get('/:tokenId', async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    
    // Get from database
    const issuance = await NFTIssuance.findOne({ tokenId })
      .populate('user', 'name wallet')
      .populate('event', 'name startDate venue organizer')
      .populate('badgeType', 'name description category design');
    
    if (!issuance) {
      return res.status(404).json({
        success: false,
        message: 'NFT not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        nft: {
          tokenId: issuance.tokenId,
          owner: issuance.user.wallet,
          ownerName: issuance.user.name,
          contractType: issuance.contractType,
          badgeType: issuance.badgeType,
          event: issuance.event,
          metadataURI: issuance.metadataURI,
          metadataCID: issuance.metadataCID,
          issuedAt: issuance.createdAt,
          transactionHash: issuance.transactionHash,
          blockNumber: issuance.blockNumber,
          isRevoked: issuance.isRevoked,
          revocationReason: issuance.revocationReason
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
