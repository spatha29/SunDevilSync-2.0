const express = require('express');
const { auth } = require('../middleware/auth');
const NFTIssuance = require('../models/NFTIssuance');
const blockchainService = require('../services/blockchain');

const router = express.Router();

// @route   GET /api/v1/wallets/:address/nfts
// @desc    Get NFTs for a wallet
// @access  Public
router.get('/:address/nfts', async (req, res, next) => {
  try {
    const { address } = req.params;
    
    // Get user NFTs from database
    const issuances = await NFTIssuance.find({
      status: 'completed'
    })
      .populate('user', 'wallet name')
      .populate('event', 'name startDate venue')
      .populate('badgeType', 'name category design')
      .sort({ createdAt: -1 });
    
    // Filter by wallet address
    const nfts = issuances.filter(i => 
      i.user.wallet && i.user.wallet.toLowerCase() === address.toLowerCase()
    );
    
    res.json({
      success: true,
      data: {
        nfts: nfts.map(nft => ({
          tokenId: nft.tokenId,
          contractType: nft.contractType,
          badgeType: nft.badgeType,
          event: nft.event,
          metadataURI: nft.metadataURI,
          issuedAt: nft.createdAt,
          transactionHash: nft.transactionHash,
          isRevoked: nft.isRevoked
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
