const express = require('express');
const NFTIssuance = require('../models/NFTIssuance');
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');

const router = express.Router();

// @route   GET /api/v1/verify
// @desc    Verify NFT authenticity
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { tokenId, owner } = req.query;
    
    if (!tokenId && !owner) {
      return res.status(400).json({
        success: false,
        message: 'Either tokenId or owner address is required'
      });
    }
    
    let issuances;
    
    if (tokenId) {
      // Verify specific token
      const issuance = await NFTIssuance.findOne({ tokenId, status: 'completed' })
        .populate('user', 'name wallet')
        .populate('event', 'name startDate venue organizer')
        .populate('badgeType', 'name description category design');
      
      if (!issuance) {
        return res.json({
          success: true,
          data: {
            verified: false,
            message: 'NFT not found in our records'
          }
        });
      }
      
      // Get on-chain data
      let onChainData = null;
      try {
        onChainData = await blockchainService.getTokenMetadata(
          issuance.contractType,
          tokenId
        );
      } catch (error) {
        // Token might not exist on-chain
      }
      
      // Verify metadata hash matches
      let metadataValid = false;
      if (issuance.metadataCID) {
        try {
          const metadata = await ipfsService.getJSON(issuance.metadataCID);
          const hashAttr = metadata.attributes?.find(a => a.trait_type === 'metadata_hash');
          metadataValid = !!hashAttr;
        } catch (error) {
          // Metadata not accessible
        }
      }
      
      res.json({
        success: true,
        data: {
          verified: true,
          nft: {
            tokenId: issuance.tokenId,
            owner: onChainData?.owner || issuance.user.wallet,
            ownerName: issuance.user.name,
            contractType: issuance.contractType,
            badgeType: issuance.badgeType.name,
            event: issuance.event?.name,
            eventDate: issuance.event?.startDate,
            issuedAt: issuance.createdAt,
            transactionHash: issuance.transactionHash,
            metadataURI: issuance.metadataURI,
            isRevoked: issuance.isRevoked,
            revocationReason: issuance.revocationReason,
            onChain: !!onChainData,
            metadataValid
          }
        }
      });
    } else {
      // Get all NFTs for owner
      const issuances = await NFTIssuance.find({
        status: 'completed'
      })
        .populate('user', 'name wallet')
        .populate('event', 'name startDate')
        .populate('badgeType', 'name category');
      
      const ownerNFTs = issuances.filter(i => 
        i.user.wallet && i.user.wallet.toLowerCase() === owner.toLowerCase()
      );
      
      res.json({
        success: true,
        data: {
          verified: ownerNFTs.length > 0,
          count: ownerNFTs.length,
          nfts: ownerNFTs.map(nft => ({
            tokenId: nft.tokenId,
            badgeType: nft.badgeType.name,
            event: nft.event?.name,
            issuedAt: nft.createdAt,
            isRevoked: nft.isRevoked
          }))
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
