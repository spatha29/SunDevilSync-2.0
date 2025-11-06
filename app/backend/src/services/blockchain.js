const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Achievement SBT ABI (minimal, add full ABI from artifacts)
const ACHIEVEMENT_ABI = [
  "function mint(address to, bytes32 eventId, bytes32 badgeType, string metadataURI) returns (uint256)",
  "function mintWithPermit(address to, bytes32 eventId, bytes32 badgeType, string metadataURI, uint256 deadline, bytes signature) returns (uint256)",
  "function batchMint(address[] recipients, bytes32[] eventIds, bytes32[] badgeTypes, string[] metadataURIs)",
  "function revoke(uint256 tokenId, string reason)",
  "function getTokenMetadata(uint256 tokenId) view returns (bytes32 eventId, bytes32 badgeType, uint256 issuedAt, bool transferLock, bool isRevoked, string revocationReason)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function nonces(address owner) view returns (uint256)",
  "event AchievementMinted(uint256 indexed tokenId, address indexed recipient, bytes32 indexed eventId, bytes32 badgeType, string metadataURI, uint256 timestamp)"
];

// Collectible ABI (minimal)
const COLLECTIBLE_ABI = [
  "function mint(address to, bytes32 collectibleType, string metadataURI, uint256 series) returns (uint256)",
  "function mintWithPermit(address to, bytes32 collectibleType, string metadataURI, uint256 series, uint256 deadline, bytes signature) returns (uint256)",
  "function batchMint(address[] recipients, bytes32[] collectibleTypes, string[] metadataURIs, uint256 series)",
  "function setMaxSupply(bytes32 collectibleType, uint256 maxSupply)",
  "function getTokenMetadata(uint256 tokenId) view returns (bytes32 collectibleType, uint256 issuedAt, uint256 series, uint256 serialNumber, uint256 maxSupply, uint256 currentSupply)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function nonces(address owner) view returns (uint256)",
  "event CollectibleMinted(uint256 indexed tokenId, address indexed recipient, bytes32 indexed collectibleType, string metadataURI, uint256 series, uint256 serialNumber, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.minterWallet = null;
    this.achievementContract = null;
    this.collectibleContract = null;
    this.initialize();
  }

  initialize() {
    try {
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
      
      // Setup minter wallet
      if (!process.env.MINTER_PRIVATE_KEY) {
        logger.warn('MINTER_PRIVATE_KEY not set. Minting will not be available.');
        return;
      }
      
      this.minterWallet = new ethers.Wallet(
        process.env.MINTER_PRIVATE_KEY,
        this.provider
      );

      // Setup contracts
      if (process.env.ACHIEVEMENT_CONTRACT_ADDRESS) {
        this.achievementContract = new ethers.Contract(
          process.env.ACHIEVEMENT_CONTRACT_ADDRESS,
          ACHIEVEMENT_ABI,
          this.minterWallet
        );
      }

      if (process.env.COLLECTIBLE_CONTRACT_ADDRESS) {
        this.collectibleContract = new ethers.Contract(
          process.env.COLLECTIBLE_CONTRACT_ADDRESS,
          COLLECTIBLE_ABI,
          this.minterWallet
        );
      }

      logger.info('Blockchain service initialized');
      logger.info(`Minter address: ${this.minterWallet.address}`);
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async getChainId() {
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async getMinterBalance() {
    const balance = await this.provider.getBalance(this.minterWallet.address);
    return ethers.formatEther(balance);
  }

  // Generate EIP-712 signature for minting permit
  async signMintPermit(contractType, recipient, eventId, badgeType, metadataURI) {
    const contractAddress = contractType === 'achievement' 
      ? process.env.ACHIEVEMENT_CONTRACT_ADDRESS 
      : process.env.COLLECTIBLE_CONTRACT_ADDRESS;

    const contract = contractType === 'achievement' 
      ? this.achievementContract 
      : this.collectibleContract;

    const nonce = await contract.nonces(recipient);
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const domain = {
      name: contractType === 'achievement' ? 'SunDevilSync Achievement' : 'SunDevilSync Collectible',
      version: '1',
      chainId: await this.getChainId(),
      verifyingContract: contractAddress
    };

    const types = contractType === 'achievement' ? {
      MintPermit: [
        { name: 'to', type: 'address' },
        { name: 'eventId', type: 'bytes32' },
        { name: 'badgeType', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    } : {
      MintPermit: [
        { name: 'to', type: 'address' },
        { name: 'collectibleType', type: 'bytes32' },
        { name: 'metadataURI', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const value = contractType === 'achievement' ? {
      to: recipient,
      eventId: eventId,
      badgeType: badgeType,
      metadataURI: metadataURI,
      nonce: nonce,
      deadline: deadline
    } : {
      to: recipient,
      collectibleType: badgeType,
      metadataURI: metadataURI,
      nonce: nonce,
      deadline: deadline
    };

    const signature = await this.minterWallet.signTypedData(domain, types, value);

    return { signature, deadline };
  }

  // Mint achievement NFT
  async mintAchievement(recipient, eventId, badgeType, metadataURI) {
    try {
      const eventIdBytes32 = ethers.id(eventId);
      const badgeTypeBytes32 = ethers.id(badgeType);

      const tx = await this.achievementContract.mint(
        recipient,
        eventIdBytes32,
        badgeTypeBytes32,
        metadataURI
      );

      const receipt = await tx.wait();
      
      // Extract token ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.achievementContract.interface.parseLog(log);
          return parsed.name === 'AchievementMinted';
        } catch {
          return false;
        }
      });

      const parsedEvent = this.achievementContract.interface.parseLog(event);
      const tokenId = parsedEvent.args.tokenId;

      return {
        tokenId: tokenId.toString(),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Failed to mint achievement:', error);
      throw error;
    }
  }

  // Batch mint achievements
  async batchMintAchievements(recipients, eventIds, badgeTypes, metadataURIs) {
    try {
      const eventIdBytes32 = eventIds.map(id => ethers.id(id));
      const badgeTypeBytes32 = badgeTypes.map(type => ethers.id(type));

      const tx = await this.achievementContract.batchMint(
        recipients,
        eventIdBytes32,
        badgeTypeBytes32,
        metadataURIs
      );

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        count: recipients.length
      };
    } catch (error) {
      logger.error('Failed to batch mint achievements:', error);
      throw error;
    }
  }

  // Revoke achievement
  async revokeAchievement(tokenId, reason) {
    try {
      const tx = await this.achievementContract.revoke(tokenId, reason);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Failed to revoke achievement:', error);
      throw error;
    }
  }

  // Get token metadata from chain
  async getTokenMetadata(contractType, tokenId) {
    try {
      const contract = contractType === 'achievement' 
        ? this.achievementContract 
        : this.collectibleContract;

      const metadata = await contract.getTokenMetadata(tokenId);
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);

      return {
        owner,
        tokenURI,
        metadata
      };
    } catch (error) {
      logger.error('Failed to get token metadata:', error);
      throw error;
    }
  }

  // Mint collectible NFT
  async mintCollectible(recipient, collectibleType, metadataURI, series = 1) {
    try {
      const collectibleTypeBytes32 = ethers.id(collectibleType);

      const tx = await this.collectibleContract.mint(
        recipient,
        collectibleTypeBytes32,
        metadataURI,
        series
      );

      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.collectibleContract.interface.parseLog(log);
          return parsed.name === 'CollectibleMinted';
        } catch {
          return false;
        }
      });

      const parsedEvent = this.collectibleContract.interface.parseLog(event);
      const tokenId = parsedEvent.args.tokenId;

      return {
        tokenId: tokenId.toString(),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Failed to mint collectible:', error);
      throw error;
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
