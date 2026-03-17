# SunDevilSync 2.0 – NFT Gamified Event Portal

**Author:** Shristi
**Program:** MS Computer Science – Arizona State University

---

## 🎥 Demo Video

<video src="demo/SunDevilSync.mp4" controls width="700"></video>

If the video does not load, open it directly:
👉 [Watch Demo](demo/SunDevilSync.mp4)

---

## 🏗 Architecture Diagram

![Architecture Diagram](demo/SunDevilSync%202.0%20Architecture.png)

---

## Project Description

SunDevilSync 2.0 is a blockchain-based event management platform that rewards students with verifiable NFT badges for participation in campus events. The system issues non-transferable achievement NFTs for attendance and credentials, while also enabling tradable collectible NFTs for referrals and special events.

### Key Features

* **Event Management**: Browse, enroll, and check-in to campus events
* **NFT Achievement Badges**: Blockchain-verified credentials on Polygon
* **Dual NFT System**

  * **AchievementSBT**: Non-transferable achievement NFTs (attendance, winner, volunteer badges)
  * **Collectible721**: Transferable collectible NFTs (referrals, limited editions)
* **Verification Portal**: Public verification for employers and faculty
* **Wallet Integration**: MetaMask and WalletConnect support
* **IPFS Metadata**: Decentralized metadata storage with privacy protection

---

## Technology Stack

* **Blockchain:** Polygon (Mumbai Testnet)
* **Smart Contracts:** Solidity 0.8.x, OpenZeppelin ERC-721
* **Development:** Hardhat
* **Backend:** Node.js, Express, MongoDB, Redis *(planned)*
* **Frontend:** React, TailwindCSS *(planned)*
* **IPFS:** Pinata *(planned)*

---

# Smart Contracts

## 1️⃣ AchievementSBT.sol

Non-transferable achievement NFT contract for credentials and participation badges.

### Key Features

* ERC-721 compliant with transfer restrictions
* EIP-712 permit-based minting
* Role-based access control
* Token-level transfer locks (soulbound functionality)
* On-chain revocation system
* Batch minting for gas efficiency
* Pausable for emergency stops

### Main Functions

```solidity
function mintWithPermit(
    address to,
    bytes32 eventId,
    bytes32 badgeType,
    string metadataURI,
    uint256 deadline,
    bytes signature
) returns (uint256)
```

```solidity
function mint(
    address to,
    bytes32 eventId,
    bytes32 badgeType,
    string metadataURI
) returns (uint256)
```

```solidity
function batchMint(
    address[] recipients,
    bytes32[] eventIds,
    bytes32[] badgeTypes,
    string[] metadataURIs
)
```

```solidity
function revoke(uint256 tokenId, string reason)
```

---

## 2️⃣ Collectible721.sol

Transferable collectible NFT contract for rewards and trading.

### Key Features

* Standard ERC-721 with full transferability
* Permit-based minting
* Scarcity controls (max supply per type)
* Series tracking
* Role-based access control
* Batch minting support

---

# Dependencies

## Prerequisites

* Node.js v18+
* npm or yarn
* Git

---

# Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/spatha29/SunDevilSync-2.0.git
cd SunDevilSync-2.0
```

---

## 2️⃣ Install Dependencies

```bash
cd contracts
npm install
```

---

## 3️⃣ Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```
POLYGON_TESTNET_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com
DEPLOYER_PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BACKEND_MINTER_ADDRESS=0x0000000000000000000000000000000000000000
```

---

# Compile Contracts

```bash
npm run compile
```

---

# Run Tests

```bash
npm test
```

Run coverage:

```bash
npm run test:coverage
```

---

# Deployment

### Deploy to Local Hardhat Network

```bash
npm run node
npm run deploy:local
```

---

### Deploy to Polygon Mumbai Testnet

```bash
npm run deploy:testnet
```

---

# Project Structure

```
SunDevilSync-2.0
│
├── contracts
│   ├── contracts
│   │   ├── AchievementSBT.sol
│   │   └── Collectible721.sol
│   ├── test
│   ├── scripts
│   ├── hardhat.config.js
│   └── package.json
│
├── demo
│   ├── SunDevilSync.mp4
│   └── SunDevilSync 2.0 Architecture.png
│
└── README.md
```

---

# Testing

Run the full test suite:

```bash
cd contracts
npm test
```

Coverage includes:

* Role-based access control
* Minting logic
* Transfer restrictions
* Revocation system
* Permit signatures
* Pausability
* Edge case handling

---

# Security Features

* **EIP-712 Signature Authorization**
* **Role-Based Access Control**
* **Transfer Locks (Soulbound NFTs)**
* **Reentrancy Protection**
* **Pausable Contracts**
* **OpenZeppelin Audited Libraries**

---

# NFT Metadata Example

```json
{
  "name": "ASU • Hackathon 2025 • Attendance",
  "description": "Verified on-chain proof of attendance.",
  "image": "ipfs://<CID>/badge.png",
  "attributes": [
    {"trait_type": "event_name", "value": "ASU Hackathon"},
    {"trait_type": "badge_type", "value": "Attendance"},
    {"trait_type": "issuer", "value": "SunDevilSync 2.0"}
  ]
}
```

---

# 👩‍💻 Author

**Shristi**
MS Computer Science
Arizona State University

---

**Built with ❤️ for ASU students, by ASU students**
