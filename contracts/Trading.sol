// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PokemonTrading
 * @dev Contract for trading Pokemon cards with fixed price, English auctions, and Dutch auctions
 */
contract Trading is IERC721Receiver, ReentrancyGuard, Pausable, AccessControl {

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Listing counter
    uint256 private _nextListingId;

    // Sale types
    enum SaleType { FixedPrice, EnglishAuction, DutchAuction }

    // Listing status
    enum ListingStatus { Active, Sold, Cancelled, Expired }

    // Struct for a listing
    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;       // Fixed price or starting price for auctions
        uint256 endPrice;    // Only for Dutch auction (lower than startPrice)
        uint256 startTime;   // Auction start time or listing time
        uint256 endTime;     // Auction end time or expiration time
        address highestBidder;
        uint256 highestBid;
        SaleType saleType;
        ListingStatus status;
    }

    // Mapping of listing ID to Listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping of address to pending withdrawals (for secure withdrawal pattern)
    mapping(address => uint256) public pendingWithdrawals;
    
    // Commit-reveal scheme for bid commitments (front-running prevention)
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => uint256) public commitTimestamps;
    uint256 public constant COMMIT_REVEAL_WINDOW = 10 minutes;

    // Platform fee percentage (in basis points, 1% = 100)
    uint256 public platformFeePercentage = 100; 
    
    // Fee recipient address
    address public feeRecipient;

    // Events
    event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price, SaleType saleType);
    event ListingCancelled(uint256 indexed listingId);
    event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event BidCommitted(address indexed bidder, bytes32 indexed commitmentHash);
    event BidRevealed(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event WithdrawalProcessed(address indexed recipient, uint256 amount);
    event FeePercentageChanged(uint256 oldFee, uint256 newFee);
    event FeeRecipientChanged(address oldRecipient, address newRecipient);
    event EmergencyWithdrawal(address indexed nftContract, uint256 tokenId, address recipient);

    /**
     * @dev Constructor sets up roles and fee recipient
     */
    constructor(address initialAdmin, address initialFeeRecipient) {
        require(initialAdmin != address(0), "Invalid admin address");
        require(initialFeeRecipient != address(0), "Invalid fee recipient");
        
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ADMIN_ROLE, initialAdmin);
        
        feeRecipient = initialFeeRecipient;
    }

    /**
     * @dev Create a fixed price listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Fixed price in wei
     * @param duration Duration of the listing in seconds
     */
    function createFixedPriceListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 duration
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(duration >= 1 hours, "Duration too short");
        require(duration <= 30 days, "Duration too long");
        
        _createListing(nftContract, tokenId, price, 0, duration, SaleType.FixedPrice);
    }

    /**
     * @dev Create an English auction listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param startingPrice Starting price in wei
     * @param duration Duration of the auction in seconds
     */
    function createEnglishAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external whenNotPaused nonReentrant {
        require(startingPrice > 0, "Starting price must be greater than zero");
        require(duration >= 1 days, "Duration too short");
        require(duration <= 14 days, "Duration too long");
        
        _createListing(nftContract, tokenId, startingPrice, 0, duration, SaleType.EnglishAuction);
    }

    /**
     * @dev Create a Dutch auction listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param startingPrice Starting price in wei (high price)
     * @param endPrice End price in wei (low price)
     * @param duration Duration of the auction in seconds
     */
    function createDutchAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 endPrice,
        uint256 duration
    ) external whenNotPaused nonReentrant {
        require(startingPrice > endPrice, "Starting price must be greater than end price");
        require(endPrice > 0, "End price must be greater than zero");
        require(duration >= 1 hours, "Duration too short");
        require(duration <= 7 days, "Duration too long");
        
        _createListing(nftContract, tokenId, startingPrice, endPrice, duration, SaleType.DutchAuction);
    }

    /**
     * @dev Internal function to create a listing
     */
    function _createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 endPrice,
        uint256 duration,
        SaleType saleType
    ) internal {
        // Get the current listing ID and increment for next listing
        uint256 listingId = _nextListingId;
        _nextListingId++;
        
        // Transfer the NFT to this contract
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Create the listing
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            endPrice: endPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            highestBid: 0,
            saleType: saleType,
            status: ListingStatus.Active
        });
        
        emit ListingCreated(listingId, msg.sender, nftContract, tokenId, price, saleType);
    }

    /**
     * @dev Cancel a listing (only the seller can cancel)
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing is not active");
        require(listing.seller == msg.sender, "Only seller can cancel");
        
        // For auctions with bids, don't allow cancellation
        if (listing.saleType != SaleType.FixedPrice && listing.highestBidder != address(0)) {
            revert("Cannot cancel auction with bids");
        }
        
        // Update status
        listing.status = ListingStatus.Cancelled;
        
        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(address(this), listing.seller, listing.tokenId);
        
        emit ListingCancelled(listingId);
    }

    /**
     * @dev Buy a fixed price listing
     * @param listingId ID of the listing to buy
     */
    function buyNow(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing is not active");
        require(listing.saleType == SaleType.FixedPrice, "Listing is not fixed price");
        require(block.timestamp <= listing.endTime, "Listing has expired");
        
        uint256 price = getCurrentPrice(listingId);
        require(msg.value >= price, "Insufficient payment");
        
        // Update listing status
        listing.status = ListingStatus.Sold;
        
        // Process the sale
        _processSale(listingId, msg.sender, price);
        
        // Refund excess payment if any
        if (msg.value > price) {
            (bool success, ) = msg.sender.call{value: msg.value - price}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Bid on an English auction
     * @param listingId ID of the auction to bid on
     */
    function placeBid(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Auction is not active");
        require(listing.saleType == SaleType.EnglishAuction, "Not an English auction");
        require(block.timestamp <= listing.endTime, "Auction has ended");
        
        // Minimum bid increment (5%)
        uint256 minBid = listing.highestBid == 0 ? listing.price : (listing.highestBid * 105) / 100;
        require(msg.value >= minBid, "Bid too low");
        
        // Refund previous highest bidder
        if (listing.highestBidder != address(0)) {
            pendingWithdrawals[listing.highestBidder] = pendingWithdrawals[listing.highestBidder] + listing.highestBid;
        }
        
        // Update highest bid
        listing.highestBidder = msg.sender;
        listing.highestBid = msg.value;
        
        // Extend auction by 5 minutes if bid placed in last 5 minutes
        if (listing.endTime - block.timestamp < 5 minutes) {
            listing.endTime = block.timestamp + 5 minutes;
        }
        
        emit BidPlaced(listingId, msg.sender, msg.value);
    }

    /**
     * @dev Commit a bid (front-running prevention)
     * @param commitmentHash Hash of bid details
     * @notice Hash should be keccak256(abi.encodePacked(listingId, bidAmount, nonce, bidder))
     */
    function commitBid(bytes32 commitmentHash) external whenNotPaused {
        require(!commitments[commitmentHash], "Commitment already exists");
        
        // Store commitment and timestamp
        commitments[commitmentHash] = true;
        commitTimestamps[commitmentHash] = block.timestamp;
        
        emit BidCommitted(msg.sender, commitmentHash);
    }

    /**
     * @dev Reveal a bid with commit-reveal scheme
     * @param listingId ID of the auction
     * @param bidAmount Amount of the bid
     * @param nonce Random nonce used in the commitment
     */
    function revealBid(uint256 listingId, uint256 bidAmount, uint256 nonce) external payable whenNotPaused nonReentrant {
        // Calculate the commitment hash
        bytes32 commitmentHash = keccak256(abi.encodePacked(listingId, bidAmount, nonce, msg.sender));
        
        // Verify commitment exists and is within time window
        require(commitments[commitmentHash], "Commitment does not exist");
        require(block.timestamp <= commitTimestamps[commitmentHash] + COMMIT_REVEAL_WINDOW, "Reveal window expired");
        
        // Verify payment matches bid
        require(msg.value == bidAmount, "Payment does not match bid amount");
        
        // Delete commitment to prevent reuse
        delete commitments[commitmentHash];
        delete commitTimestamps[commitmentHash];
        
        // Process as regular bid
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Auction is not active");
        require(listing.saleType == SaleType.EnglishAuction, "Not an English auction");
        require(block.timestamp <= listing.endTime, "Auction has ended");
        
        // Minimum bid increment (5%)
        uint256 minBid = listing.highestBid == 0 ? listing.price : (listing.highestBid * 105) / 100;
        require(bidAmount >= minBid, "Bid too low");
        
        // Refund previous highest bidder
        if (listing.highestBidder != address(0)) {
            pendingWithdrawals[listing.highestBidder] = pendingWithdrawals[listing.highestBidder] + listing.highestBid;
        }
        
        // Update highest bid
        listing.highestBidder = msg.sender;
        listing.highestBid = bidAmount;
        
        // Extend auction by 5 minutes if bid placed in last 5 minutes
        if (listing.endTime - block.timestamp < 5 minutes) {
            listing.endTime = block.timestamp + 5 minutes;
        }
        
        emit BidRevealed(listingId, msg.sender, bidAmount);
    }

    /**
     * @dev Finalize an auction after it has ended
     * @param listingId ID of the auction to finalize
     */
    function finalizeAuction(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Auction is not active");
        require(listing.saleType == SaleType.EnglishAuction, "Not an English auction");
        require(block.timestamp > listing.endTime, "Auction has not ended yet");
        
        if (listing.highestBidder != address(0)) {
            // Auction succeeded with a bid
            listing.status = ListingStatus.Sold;
            _processSale(listingId, listing.highestBidder, listing.highestBid);
        } else {
            // No bids, return NFT to seller
            listing.status = ListingStatus.Expired;
            IERC721(listing.nftContract).safeTransferFrom(address(this), listing.seller, listing.tokenId);
        }
    }

    /**
     * @dev Get current price for Dutch auction (decreases linearly over time)
     * @param listingId ID of the listing
     * @return Current price in wei
     */
    function getCurrentPrice(uint256 listingId) public view returns (uint256) {
        Listing storage listing = listings[listingId];
        
        if (listing.saleType != SaleType.DutchAuction) {
            return listing.price;
        }
        
        if (block.timestamp >= listing.endTime) {
            return listing.endPrice;
        }
        
        uint256 totalDuration = listing.endTime - listing.startTime;
        uint256 timeElapsed = block.timestamp - listing.startTime;
        uint256 priceDifference = listing.price - listing.endPrice;
        
        // Linear price decrease
        return listing.price - (priceDifference * timeElapsed / totalDuration);
    }

    /**
     * @dev Internal function to process a sale
     * @param listingId ID of the listing
     * @param buyer Address of the buyer
     * @param amount Amount paid in wei
     */
    function _processSale(uint256 listingId, address buyer, uint256 amount) internal {
        Listing storage listing = listings[listingId];
        
        // Calculate fee
        uint256 fee = (amount * platformFeePercentage) / 10000;
        uint256 sellerAmount = amount - fee;
        
        // Add seller's proceeds to pending withdrawals
        pendingWithdrawals[listing.seller] = pendingWithdrawals[listing.seller] + sellerAmount;
        
        // Add fee to fee recipient's pending withdrawals
        pendingWithdrawals[feeRecipient] = pendingWithdrawals[feeRecipient] + fee;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(address(this), buyer, listing.tokenId);
        
        emit ListingSold(listingId, buyer, amount);
    }

    /**
     * @dev Withdraw pending balance (secure withdrawal pattern)
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        // Reset balance before sending to prevent reentrancy
        pendingWithdrawals[msg.sender] = 0;
        
        // Transfer funds
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalProcessed(msg.sender, amount);
    }

    /**
     * @dev Set platform fee percentage (admin only)
     * @param newFeePercentage New fee percentage in basis points (1% = 100)
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyRole(ADMIN_ROLE) {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit FeePercentageChanged(oldFee, newFeePercentage);
    }

    /**
     * @dev Set fee recipient (admin only)
     * @param newFeeRecipient Address of the new fee recipient
     */
    function setFeeRecipient(address newFeeRecipient) external onlyRole(ADMIN_ROLE) {
        require(newFeeRecipient != address(0), "Invalid address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientChanged(oldRecipient, newFeeRecipient);
    }

    /**
     * @dev Pause contract (for emergency) (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency withdraw NFT (admin only)
     * In case of critical issues
     */
    function emergencyWithdrawNFT(address nftContract, uint256 tokenId, address recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        
        IERC721(nftContract).safeTransferFrom(address(this), recipient, tokenId);
        
        emit EmergencyWithdrawal(nftContract, tokenId, recipient);
    }

    /**
     * @dev Check if a listing is expired
     * @param listingId ID of the listing
     * @return true if expired
     */
    function isListingExpired(uint256 listingId) public view returns (bool) {
        Listing storage listing = listings[listingId];
        return listing.status == ListingStatus.Active && block.timestamp > listing.endTime;
    }

    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     */
    function getListingDetails(uint256 listingId) external view returns (
        address seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 endPrice,
        uint256 startTime,
        uint256 endTime,
        address highestBidder,
        uint256 highestBid,
        SaleType saleType,
        ListingStatus status,
        uint256 currentPrice
    ) {
        Listing storage listing = listings[listingId];
        
        return (
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            listing.price,
            listing.endPrice,
            listing.startTime,
            listing.endTime,
            listing.highestBidder,
            listing.highestBid,
            listing.saleType,
            listing.status,
            getCurrentPrice(listingId)
        );
    }

    /**
     * @dev Implementation of ERC721 receiver for safe transfers
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}