# SunDevilSync 2.0 – Blockchain Event Management & Credential Platform

Smart contracts powering **SunDevilSync 2.0**, a decentralized event management and credential verification platform built on the **Polygon blockchain**.

The platform enables universities and organizations to issue **tamper-proof digital achievements and collectibles** using NFTs.

---

# 🎥 Demo Video

Project demonstration of the **SunDevilSync 2.0 Gamified Event Portal**

demo/SunDevilSync.mp4

---

# 🏗 System Architecture

![SunDevilSync Architecture](demo/SunDevilSync%202.0%20Architecture.png)

The architecture demonstrates the interaction between:

- **Frontend Event Portal**
- **Backend Event Service**
- **Polygon Smart Contracts**
- **Wallet Authentication (MetaMask)**
- **IPFS Metadata Storage**
- **Credential Verification Layer**

This design ensures secure credential issuance and decentralized verification.

---

# 🚀 Project Overview

SunDevilSync 2.0 is a **blockchain-based event management platform** designed for universities and organizations.

It enables:

- Secure **event participation tracking**
- Issuing **NFT-based achievements**
- **Soulbound-style credentials** that cannot be transferred
- Collectible NFTs for gamified engagement
- Transparent credential verification on-chain

The system uses **ERC-721 NFTs with custom controls** to ensure authenticity and prevent fraud.

---

# ⚙️ Smart Contracts

## AchievementSBT

A **non-transferable NFT** representing event achievements.

Features:

- ERC-721 compliant with transfer restrictions
- Soulbound-style tokens (non-transferable by default)
- EIP-712 permit-based minting
- Role-based access control
- Token revocation support
- Batch minting for events
- Transfer lock enforcement
- On-chain metadata
- Emergency pause mechanism

---

## Collectible721

A **transferable NFT** used for gamified rewards.

Features:

- Fully transferable ERC-721 tokens
- Permit-based minting
- Scarcity controls (max supply)
- Series tracking
- Serial number generation
- Batch minting
- Role-based permissions

---

# 🧰 Tech Stack

- Solidity
- Hardhat
- OpenZeppelin Contracts
- Polygon Blockchain
- Ethers.js
- Node.js
- ERC-721 NFTs
- EIP-712 Signatures

---

# 🏗 Project Structure

```
contracts/
│
├── contracts/
│   ├── AchievementSBT.sol
│   └── Collectible721.sol
│
├── scripts/
│   └── deploy.js
│
├── test/
│   ├── AchievementSBT.test.js
│   └── Collectible721.test.js
│
├── hardhat.config.js
└── package.json

demo/
├── SunDevilSync.mov
└── SunDevilSync 2.0 Architecture.png
```

---

# 🛠 Setup

## Prerequisites

- Node.js **v18+**
- npm or yarn

---

## Install Dependencies

```bash
cd contracts
npm install
```

---

## Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Example configuration:

```
POLYGON_TESTNET_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com

DEPLOYER_PRIVATE_KEY=your_private_key_here

POLYGONSCAN_API_KEY=your_polygonscan_api_key

BACKEND_MINTER_ADDRESS=0x0000000000000000000000000000000000000000
```

---

# 🧪 Development

## Compile Contracts

```
npm run compile
```

## Run Tests

```
npm test
```

## Test Coverage

```
npm run test:coverage
```

---

# 🔗 Local Development

Start a local blockchain:

```
npm run node
```

Deploy contracts locally:

```
npm run deploy:local
```

---

# 🚀 Deployment

Deploy to Polygon testnet:

```
npm run deploy:testnet
```

Verify contracts:

```
npm run verify
```

Manual verification:

```
npx hardhat verify --network polygon_testnet CONTRACT_ADDRESS
```

---

# 🧾 Contract Interaction Examples

### Grant Minter Role

```javascript
const MINTER_ROLE = await contract.MINTER_ROLE();
await contract.grantRole(MINTER_ROLE, backendAddress);
```

---

### Mint Achievement

```javascript
const eventId = ethers.id("event_hackathon_2025");
const badgeType = ethers.id("badge_attendance");

await achievementSBT.mint(
  recipientAddress,
  eventId,
  badgeType,
  "ipfs://metadata"
);
```

---

### Mint Using Permit

```javascript
await contract.mintWithPermit(
  recipientAddress,
  eventId,
  badgeType,
  metadataURI,
  deadline,
  signature
);
```

---

### Set Max Supply

```javascript
await collectible721.setMaxSupply(collectibleType, maxSupply);
```

---

### Revoke Achievement

```javascript
await achievementSBT.revoke(tokenId, "Fraudulent attendance");
```

---

# 🔐 Security Considerations

## Role Structure

| Role | Responsibility |
|-----|-----|
| DEFAULT_ADMIN_ROLE | Contract administration |
| MINTER_ROLE | Backend minting service |
| PAUSER_ROLE | Emergency pause |
| REVOKER_ROLE | Credential revocation |

---

## Best Practices

- Use **multisig wallets** for admin roles
- Protect backend keys using **HSM / KMS**
- Run full test suite before deployment
- Monitor contract events
- Audit contracts before mainnet deployment

---

# ⛽ Gas Optimization

Batch minting reduces costs during large events.

Example:

```javascript
await achievementSBT.batchMint(
  [addr1, addr2],
  [eventId, eventId],
  [badgeType, badgeType],
  [uri1, uri2]
);
```

Estimated Polygon Gas Usage:

| Operation | Gas |
|------|------|
| Single Mint | ~150k |
| Batch Mint (10) | ~800k |
| Revocation | ~50k |

---

# 🧪 Testing

Test coverage includes:

- Access control
- Minting logic
- Batch operations
- Transfer restrictions
- Revocation system
- Scarcity controls
- Permit signature verification
- Pausability

Run tests:

```
npm test
```

---

# 👩‍💻 Author

**Shristi**  
MS Computer Science  
Arizona State University

Project developed for **SunDevilSync 2.0 – a blockchain-based event management and credential verification platform for higher education**.