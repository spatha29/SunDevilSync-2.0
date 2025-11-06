const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

class IPFSService {
  constructor() {
    this.apiUrl = process.env.IPFS_API_URL || 'https://api.pinata.cloud';
    this.apiKey = process.env.IPFS_API_KEY;
    this.secretKey = process.env.IPFS_SECRET_KEY;
    this.gateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
  }

  async pinJSON(jsonData, name) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: jsonData,
          pinataMetadata: {
            name: name
          }
        },
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          }
        }
      );

      return {
        cid: response.data.IpfsHash,
        url: `${this.gateway}/${response.data.IpfsHash}`
      };
    } catch (error) {
      logger.error('Failed to pin JSON to IPFS:', error);
      throw error;
    }
  }

  async pinFile(fileBuffer, name) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, name);
      
      const metadata = JSON.stringify({
        name: name
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey,
            ...formData.getHeaders()
          }
        }
      );

      return {
        cid: response.data.IpfsHash,
        url: `${this.gateway}/${response.data.IpfsHash}`
      };
    } catch (error) {
      logger.error('Failed to pin file to IPFS:', error);
      throw error;
    }
  }

  async getJSON(cid) {
    try {
      const response = await axios.get(`${this.gateway}/${cid}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get JSON from IPFS:', error);
      throw error;
    }
  }

  buildMetadataJSON(eventData, badgeData, recipientData) {
    const metadata = {
      name: `${badgeData.issuer || 'ASU'} • ${eventData.name} • ${badgeData.type}`,
      description: badgeData.description || `Verified on-chain proof of ${badgeData.type.toLowerCase()}.`,
      image: badgeData.imageUrl || `ipfs://${badgeData.imageCID}`,
      external_url: `${process.env.FRONTEND_URL}/verify/${recipientData.tokenId || 'pending'}`,
      attributes: [
        { trait_type: 'event_id', value: eventData.id },
        { trait_type: 'event_name', value: eventData.name },
        { trait_type: 'badge_type', value: badgeData.type },
        { trait_type: 'issued_at', value: new Date().toISOString() },
        { trait_type: 'issuer', value: badgeData.issuer || 'SunDevilSync 2.0' },
        { trait_type: 'transferable', value: badgeData.transferable ? 'true' : 'false' }
      ]
    };

    // Add optional attributes
    if (eventData.date) {
      metadata.attributes.push({ trait_type: 'event_date', value: eventData.date });
    }

    if (eventData.venue) {
      metadata.attributes.push({ trait_type: 'venue', value: eventData.venue });
    }

    if (badgeData.rarity) {
      metadata.attributes.push({ trait_type: 'rarity', value: badgeData.rarity });
    }

    // Add metadata hash for integrity verification
    const metadataString = JSON.stringify(metadata);
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(metadataString).digest('hex');
    metadata.attributes.push({ trait_type: 'metadata_hash', value: `sha256:${hash}` });

    return metadata;
  }
}

const ipfsService = new IPFSService();

module.exports = ipfsService;
