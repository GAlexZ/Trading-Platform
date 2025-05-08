## System Requirements

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- Some Ethereum wallet (I used Metamask and Phantom)

## Installation

1. Install dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

2. Compile and deploy contracts:

```bash
npx hardhat compile
npx hardhat node  # Start local Ethereum node
npx hardhat run scripts/deploy.js --network localhost
```

3. Use the contract owner's address, which you get from: npx hardhat run scripts/deploy.js --network localhost
   to access ADMIN_ROLE smart contract functionality

4. Start the frontend:

```bash
cd frontend
npm start
```

5. (Optional) Upload png to some ipfs provider
   Consider https://pinata.cloud/
   On the admin webpage use "ipfs://CIDFromTheUploadedImage"
   Scaling of the image is done automatically

## Technical Architecture

## System Architecture Diagram

┌───────────────────────────────────────┐
│ │
│ React Frontend │
│ │
├───────────┬───────────────┬───────────┤
│ Web3.js │ Context API │ Ethers.js │
├───────────┴───────────────┴───────────┤
│ │
│ MetaMask Wallet │
│ │
├───────────────────────────────────────┤
│ │
│ Ethereum Blockchain │
│ │
├───────────────────┬───────────────────┤
│ PokemonCard │ Trading │
│ Contract │ Contract │
├───────────────────┴───────────────────┤
│ │
│ IPFS (Decentralized Storage) │
│ │
└───────────────────────────────────────┘

## Project Structure

```
pokemon-trading-platform/
├── contracts/                    # Solidity smart contracts
├── scripts/                      # Deployment scripts
├── test/                         # Contract tests
├── frontend/                     # React application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── contracts/            # Contract ABIs
│       ├── pages/
│       └── utils/
└── hardhat.config.js             # Hardhat configuration
```

### Technology Stack

- **Frontend**:

  - React.js with React Router for navigation
  - TailwindCSS for styling
  - Ethers.js for blockchain interaction

- **Smart Contracts**:

  - Solidity 0.8.28
  - OpenZeppelin contract libraries
  - Hardhat development environment

- **Web3 Integration**:
  - Wallet connection ability
  - IPFS usage for decentralized storage of images

### Smart Contracts

The platform uses two primary smart contracts:

### 1. PokemonCard.sol

The PokemonCard contract is an ERC-721 implementation that represents Pokemon cards as NFTs.

```solidity
// Key data structures
struct Pokemon {
    string name;
    uint8 generation;
    string pokemonType;
    uint16 power;
    uint8 rarity;
    bool isShiny;
}

// Mappings
mapping(uint256 => Pokemon) public pokemonData;
```

#### Key Features:

- Minting new Pokemon cards with detailed attributes
- Burning Pokemon cards
- On-chain storage of Pokemon metadata (except images)
- Enumeration for efficient listing and retrieval of pokemon cards

#### Contract Inheritance:

```
ERC721
  ↑
ERC721URIStorage
  ↑
ERC721Enumerable
  ↑
Ownable
  ↑
PokemonCard
```

### 2. Trading.sol

The Trading contract manages all marketplace functionality including listings, auctions and direct purchases.

```solidity
// Enums
enum SaleType { FixedPrice, EnglishAuction, DutchAuction }
enum ListingStatus { Active, Sold, Cancelled, Expired }

// Key data structures
struct Listing {
    uint256 listingId;
    address seller;
    address nftContract;
    uint256 tokenId;
    uint256 price;
    uint256 endPrice;
    uint256 startTime;
    uint256 endTime;
    address highestBidder;
    uint256 highestBid;
    SaleType saleType;
    ListingStatus status;
}

// Mappings
mapping(uint256 => Listing) public listings;
mapping(address => uint256) public pendingWithdrawals;
mapping(bytes32 => bool) public commitments;
mapping(bytes32 => uint256) public commitTimestamps;
```

#### Key Features:

- Fixed Price, English Auction, Dutch Auction
- Bid placement and auction finalization
- Platform fee management
- Secure withdrawal pattern for ETH transfers
- Commit-reveal scheme for auction bids

#### Contract Inheritance:

```
IERC721Receiver
  ↑
ReentrancyGuard
  ↑
Pausable
  ↑
AccessControl
  ↑
Trading
```

## Frontend Architecture

### Key features

- Mobile-Responsive Design
- Advanced Filtering
- Wallet connection

The frontend is organized as follows:

src/
├── components/ # UI components
├── context/ # State management
├── contracts/ # Contract ABIs
├── pages/ # Application screens
├── utils/ # Helper functions for IPFS
└── App.jsx # Main application

### Context API for State Management

#### Web3Context

Manages wallet connection and blockchain interactions:

- Account state and authentication
- Contract instances and interactions
- Transaction functions for buying, bidding and listing

#### ListingsContext

Manages NFT listings and user's collection:

- Active listings retrieval and filtering
- User's NFTs management
- Real-time updates via contract events

### Key Components

#### NFTCard

Reusable component that displays a Pokemon card with its details, including:

- Card image (from IPFS)
- Pokemon attributes (name, type, generation, power, rarity)
- Sale information (price, auction status)
- Action buttons based on sale type and user role

#### IPFSImage

Helper Component for handling IPFS image loading:

- IPFS URI resolution to HTTP URL
- Loading states
- Fallback handling
- Consistent image scaling

## Security Features

### Smart Contract Security

1. **Reentrancy Protection**:

   - ReentrancyGuard prevents recursive calls
   - Secure withdrawal pattern for ETH transfers
   - State updates before external calls

2. **Access Control**:

   - Role-based permissions using OpenZeppelin's AccessControl
   - Owner-only functions for admin operations
   - Modifier-based access restrictions

3. **Front-running Prevention**:

   - Commit-reveal scheme for auction bids
   - Time-locked commitments
   - Minimum bid increments

4. **Emergency Measures**:
   - Pausable contract functionality
   - Emergency NFT withdrawal function
   - Admin override capabilities

### Transaction Security

1. **Input Validation**:

   - Thorough validation of all user inputs
   - Checks for valid price ranges
   - Verification of ownership before operations

2. **Error Handling**:

   - Explicit error messages
   - Transaction status tracking
   - Graceful failure modes

3. **Wallet Integration**:
   - Secure MetaMask connection
   - Transaction confirmation flows
   - Signature verification

## Testing

- Tests main features of the Trading and PokemonCard smart contracts
  Run smart contract tests:

```bash
npx hardhat test
```

### Which AI tools where used for development:

- For the frontend: claude.ai with Claude 3.7 Sonnet
- For debuggin: ChatGPT with GPT-4o or o4-mini-high
