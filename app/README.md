# SunDevilSync 2.0 - Application

Web application for the NFT Gamified Event Portal.

## Project Structure

```
app/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── config/      # Database, Redis configuration
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Blockchain, IPFS services
│   │   ├── middleware/  # Auth, error handling
│   │   ├── queues/      # BullMQ job queues
│   │   └── utils/       # Utilities
│   └── package.json
└── frontend/         # React SPA
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── contexts/    # React contexts (Auth, Wallet)
    │   ├── pages/       # Page components
    │   └── utils/       # Utilities
    └── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- MetaMask browser extension

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Key environment variables:
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `POLYGON_RPC_URL`: Polygon testnet RPC
- `ACHIEVEMENT_CONTRACT_ADDRESS`: Deployed contract address
- `COLLECTIBLE_CONTRACT_ADDRESS`: Deployed contract address
- `MINTER_PRIVATE_KEY`: Backend minter wallet private key
- `IPFS_API_KEY`, `IPFS_SECRET_KEY`: Pinata API credentials
- `JWT_SECRET`: Secret for JWT tokens

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

Key environment variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_POLYGON_CHAIN_ID`: 80001 for testnet
- `REACT_APP_ACHIEVEMENT_CONTRACT_ADDRESS`: Contract address
- `REACT_APP_COLLECTIBLE_CONTRACT_ADDRESS`: Contract address

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run individually
npm run dev:backend   # Runs on port 5000
npm run dev:frontend  # Runs on port 3000
```

### Production

```bash
# Build frontend
npm run build

# Start backend
npm start
```

## Backend Architecture

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/wallet/challenge` - Get nonce for wallet signature
- `POST /api/v1/auth/wallet/verify` - Verify wallet signature and link
- `GET /api/v1/auth/me` - Get current user

#### Events
- `GET /api/v1/events` - List events
- `POST /api/v1/events` - Create event (Organizer/Admin)
- `GET /api/v1/events/:id` - Get event details
- `POST /api/v1/events/:id/enroll` - Enroll in event
- `POST /api/v1/events/:id/checkin` - Check in to event

#### NFTs
- `GET /api/v1/wallets/:address/nfts` - Get NFTs for wallet
- `GET /api/v1/nfts/:tokenId` - Get NFT details

#### Verification
- `GET /api/v1/verify?tokenId=...` - Verify NFT by token ID
- `GET /api/v1/verify?owner=...` - Get all NFTs for owner

#### Admin
- `GET /api/v1/admin/stats` - Platform statistics
- `POST /api/v1/admin/badge-types` - Create badge type
- `POST /api/v1/admin/revoke/:tokenId` - Revoke NFT
- `GET /api/v1/admin/audit` - Audit logs

### Services

#### Blockchain Service
- Mints achievement and collectible NFTs
- Generates EIP-712 signatures for permits
- Interacts with smart contracts on Polygon
- Revokes NFTs on-chain

#### IPFS Service
- Pins JSON metadata to IPFS (via Pinata)
- Builds NFT metadata following OpenSea standard
- Retrieves metadata from IPFS
- Ensures no PII in public metadata

#### Queue Workers
- **Pin Worker**: Uploads metadata to IPFS
- **Mint Worker**: Mints NFTs on blockchain
- Handles retries and error recovery
- Rate-limited to prevent gas spikes

### Database Models

- **User**: User accounts with wallet linking
- **Event**: Event information and check-in config
- **Enrollment**: User enrollments and check-ins
- **NFTIssuance**: NFT minting records and status
- **BadgeType**: Badge type definitions and policies

## Frontend Architecture

### Pages

- **Home**: Landing page with features
- **Events**: Browse and filter events
- **EventDetail**: Event details, enrollment, check-in
- **MyBadges**: User's NFT collection
- **Verify**: Public verification portal
- **Admin**: Admin dashboard (role-restricted)
- **Login/Register**: Authentication

### Contexts

#### AuthContext
- User authentication state
- Login/logout functionality
- Wallet linking
- Role-based access

#### WalletContext
- MetaMask wallet connection
- Account and network state
- Message signing
- Transaction sending

### Features

- 🔐 JWT + Wallet-based authentication
- 💼 MetaMask wallet integration
- 📱 Responsive design
- 🎨 ASU maroon and gold theme
- ⚡ React Query for data fetching
- 🔄 Real-time updates

## Deployment

### Backend Deployment (Example: Railway/Render)

1. Set environment variables
2. Connect MongoDB and Redis
3. Deploy from Git repository
4. Set start command: `npm start`

### Frontend Deployment (Example: Vercel/Netlify)

1. Build command: `npm run build`
2. Publish directory: `build`
3. Set environment variables
4. Deploy

### Environment Checklist

- [ ] MongoDB database created
- [ ] Redis instance running
- [ ] Smart contracts deployed
- [ ] Pinata API keys obtained
- [ ] Minter wallet funded with MATIC
- [ ] Environment variables configured
- [ ] CORS origins set correctly

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Security Considerations

1. **Never commit `.env` files**
2. **Use HSM/KMS for minter key in production**
3. **Enable rate limiting in production**
4. **Use HTTPS in production**
5. **Implement CSRF protection**
6. **Sanitize all user inputs**
7. **Keep dependencies updated**

## Monitoring

### Queue Dashboard
Access BullMQ dashboard in development:
```
http://localhost:5000/admin/queues
```

### Logs
Logs are stored in `backend/logs/`:
- `error.log`: Error logs
- `combined.log`: All logs

## Common Issues

### "No authentication token provided"
- Ensure you're logged in
- Check that token is in localStorage
- Verify Authorization header format

### "Wallet not connected"
- Install MetaMask extension
- Connect to Polygon testnet
- Grant connection permission

### "Transaction failed"
- Ensure minter wallet has MATIC
- Check gas settings
- Verify contract addresses

### "Metadata not found"
- Check IPFS gateway accessibility
- Verify Pinata API credentials
- Ensure metadata was pinned successfully

## Development Workflow

1. **Start services**
   ```bash
   # Terminal 1: MongoDB
   mongod
   
   # Terminal 2: Redis
   redis-server
   
   # Terminal 3: Backend
   cd backend && npm run dev
   
   # Terminal 4: Frontend
   cd frontend && npm start
   ```

2. **Deploy contracts** (see contracts/ README)

3. **Update contract addresses** in `.env` files

4. **Create badge types** via admin API

5. **Test event flow**: Register → Enroll → Check-in → Receive NFT

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation
3. Contact the development team

## License

MIT
