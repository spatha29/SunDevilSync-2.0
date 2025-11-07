# SunDevilSync 2.0 – NFT Gamified Event Portal

A blockchain-based event management platform that rewards students with verifiable NFT badges for participation in campus events.

## 🎯 Overview

SunDevilSync 2.0 gamifies campus event participation by issuing blockchain-verified achievement badges as NFTs. Students earn non-transferable credentials for attendance and achievements, while also collecting tradable digital memorabilia.

### Key Features

- ✅ **Event Management**: Browse, enroll, and check-in to campus events
- 🏆 **NFT Badges**: Blockchain-verified achievement credentials on Polygon
- 🔐 **Wallet Integration**: MetaMask and WalletConnect support
- 📱 **QR Check-in**: Secure, rotating QR codes with anti-cheat measures
- 🎨 **Collectibles**: Tradable NFTs for referrals and special events
- ✨ **Verification Portal**: Public verification for employers/faculty
- 👨‍💼 **Admin Console**: Event and badge management dashboard

## 🏗️ Architecture

### Technology Stack

**Smart Contracts**
- Solidity 0.8.20
- ERC-721 (OpenZeppelin)
- Hardhat development environment
- Polygon (Mumbai testnet)

**Backend**
- Node.js + Express
- MongoDB (user data, events)
- Redis (caching, queues)
- BullMQ (async job processing)
- Web3.js/Ethers.js (blockchain interaction)
- Pinata (IPFS pinning)

**Frontend**
- React 18
- React Router
- TailwindCSS
- Ethers.js
- React Query

### System Components

```
┌─────────────┐
│   Students  │ ←→ Browser + MetaMask
│ Employers   │
│   Admins    │
└──────┬──────┘
       │ HTTPS + Wallet RPC
       ↓
┌──────────────────┐
│   React SPA      │
│ (Wallet Connect) │
└──────┬───────────┘
       │ REST API
       ↓
┌────────────────────────────────────┐
│        Node.js Backend             │
│  • Auth & Accounts                 │
│  • Events & Check-in               │
│  • Mint Orchestrator (EIP-712)     │
│  • Verification API                │
└─┬──────────┬──────────┬───────────┘
  │          │          │
  ↓          ↓          ↓
MongoDB   Redis    IPFS (Pinata)
  │          │          │
  └──────────┴──────────┴───→ Polygon Testnet
                           (ERC-721 Contracts)
```

## 📁 Project Structure

```
Blockchain-project/
├── contracts/              # Smart contracts
│   ├── contracts/
│   │   ├── AchievementSBT.sol      # Non-transferable achievement NFTs
│   │   └── Collectible721.sol      # Transferable collectible NFTs
│   ├── scripts/
│   │   └── deploy.js               # Deployment script
│   ├── test/                       # Contract tests
│   ├── hardhat.config.js
│   └── README.md
│
└── app/                    # Web application
    ├── backend/
    │   ├── src/
    │   │   ├── config/            # DB, Redis config
    │   │   ├── models/            # MongoDB models
    │   │   ├── routes/            # API endpoints
    │   │   ├── services/          # Blockchain, IPFS
    │   │   ├── middleware/        # Auth, errors
    │   │   ├── queues/            # Job workers
    │   │   └── server.js
    │   └── package.json
    │
    └── frontend/
        ├── src/
        │   ├── components/        # UI components
        │   ├── contexts/          # Auth, Wallet
        │   ├── pages/             # Routes
        │   └── App.js
        └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- MetaMask browser extension

### 1. Clone Repository

```bash
git clone <repository-url>
cd Blockchain-project
```

### 2. Deploy Smart Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your configuration

# Deploy to local network
npx hardhat node
npm run deploy:local

# Or deploy to Polygon testnet
npm run deploy:testnet
```

Save the deployed contract addresses for later.

### 3. Setup Backend

```bash
cd ../app/backend
npm install
cp .env.example .env
# Edit .env with:
# - MongoDB URI
# - Redis configuration
# - Contract addresses from step 2
# - Pinata API keys
# - Minter wallet private key

npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with:
# - Backend API URL
# - Contract addresses

npm start
```

Frontend runs on `http://localhost:3000`

### 5. Initialize System

1. Register an admin account
2. Create badge types via admin API
3. Create events
4. Test the flow!

## 📚 Documentation

Detailed documentation is available in each directory:

- **[contracts/README.md](contracts/README.md)** - Smart contract development, testing, deployment
- **[app/README.md](app/README.md)** - Application setup, API documentation, deployment

## 🎮 User Flows

### Student Flow

1. **Register** → Create account
2. **Connect Wallet** → Link MetaMask wallet
3. **Browse Events** → Find interesting events
4. **Enroll** → Register for event
5. **Check-in** → Scan QR code at venue
6. **Receive NFT** → Get achievement badge automatically
7. **View Collection** → See all earned badges

### Organizer Flow

1. **Create Event** → Set up event details
2. **Configure Check-in** → QR, GPS, or manual
3. **Monitor Attendance** → Track check-ins
4. **Award Badges** → Issue winner/volunteer badges
5. **View Analytics** → Event statistics

### Employer/Faculty Flow

1. **Visit Verification Page** → Public access
2. **Enter Token ID or Wallet** → Search for credentials
3. **View Proof** → See verified achievement details
4. **Verify On-Chain** → Check blockchain record

## 🔐 Security Features

- **EIP-712 Signatures**: Backend-authorized minting
- **Role-Based Access**: Admin, Organizer, Student roles
- **Anti-Cheat**: Rotating QR codes, device fingerprinting
- **PII Protection**: No personal data on-chain
- **Revocation System**: Admin can revoke fraudulent badges
- **Rate Limiting**: API and minting rate limits
- **Transfer Locks**: Achievement NFTs non-transferable

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npm test
npm run test:coverage
```

### Backend
```bash
cd app/backend
npm test
```

### Frontend
```bash
cd app/frontend
npm test
```

## 📊 Badge Types

| Type | Transferable | Use Case |
|------|--------------|----------|
| Attendance | No | Event check-in proof |
| Winner | No | Competition/contest winner |
| Volunteer | No | Volunteer service hours |
| Referral | Yes | Bring-a-friend rewards |
| Collectible | Yes | Limited edition memorabilia |

## 🌐 Deployment

### Smart Contracts
- Deploy to Polygon Mumbai testnet
- Verify on PolygonScan
- Grant MINTER_ROLE to backend service

### Backend
- Deploy to Railway/Render/AWS
- Configure environment variables
- Set up MongoDB and Redis instances
- Enable monitoring and logging

### Frontend
- Deploy to Vercel/Netlify
- Configure environment variables
- Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

SunDevilSync 2.0 - Arizona State University

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Polygon for scalable blockchain infrastructure
- Pinata for IPFS pinning services
- ASU community for inspiration and support

## 📞 Support

For issues or questions:
- GitHub Issues: [Report a bug](link-to-issues)
- Documentation: See README files in each directory
- Email: support@sundevilsync.example

---

Built with ❤️ by ASU students, for ASU students
