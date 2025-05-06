const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Trading", function () {
  // Variables used throughout the tests
  let PokemonCard, pokemonCard;
  let Trading, trading;
  let owner, feeRecipient, seller, buyer;
  let ownerAddress, feeRecipientAddress, sellerAddress, buyerAddress;

  // Common values for tests
  let FIXED_PRICE, START_PRICE, END_PRICE, ONE_DAY, PLATFORM_FEE_PERCENTAGE;
  let pokemonCardAddress, tradingAddress;

  // Deploy the contracts before each test
  beforeEach(async function () {
    // Set constants (BigInt arithmetic)
    FIXED_PRICE = ethers.parseEther("1.0");
    START_PRICE = ethers.parseEther("2.0");
    END_PRICE = ethers.parseEther("0.5");
    ONE_DAY = 86400n;
    PLATFORM_FEE_PERCENTAGE = 100n;

    // Get signer objects and their raw addresses
    [owner, feeRecipient, seller, buyer] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    feeRecipientAddress = await feeRecipient.getAddress();
    sellerAddress = await seller.getAddress();
    buyerAddress = await buyer.getAddress();

    // Deploy PokemonCard contract
    PokemonCard = await ethers.getContractFactory("PokemonCard");
    pokemonCard = await PokemonCard.deploy();
    await pokemonCard.waitForDeployment();
    pokemonCardAddress = await pokemonCard.getAddress();

    // Deploy Trading contract
    Trading = await ethers.getContractFactory("Trading");
    trading = await Trading.deploy(ownerAddress, feeRecipientAddress);
    await trading.waitForDeployment();
    tradingAddress = await trading.getAddress();

    // Mint a Pokemon card to the seller
    await pokemonCard.mintPokemon(
      sellerAddress,
      "Pikachu",
      1,
      "Electric",
      100,
      3,
      true,
      "ipfs://QmPikachuIPFSHash"
    );

    // Approve the trading contract to transfer the NFT
    await pokemonCard.connect(seller).setApprovalForAll(tradingAddress, true);
  });

  describe("Deployment", function () {
    it("Should set the right admin and fee recipient", async function () {
      expect(await trading.feeRecipient()).to.equal(feeRecipientAddress);
      expect(
        await trading.hasRole(await trading.ADMIN_ROLE(), ownerAddress)
      ).to.equal(true);
    });

    it("Should have the correct platform fee", async function () {
      expect(await trading.platformFeePercentage()).to.equal(
        PLATFORM_FEE_PERCENTAGE
      );
    });
  });

  describe("Fixed Price Listing", function () {
    it("Should create a fixed price listing", async function () {
      await trading.connect(seller).createFixedPriceListing(
        pokemonCardAddress,
        0, // Token ID
        FIXED_PRICE,
        ONE_DAY
      );

      const listing = await trading.getListingDetails(0);

      expect(listing.seller).to.equal(sellerAddress);
      expect(listing.nftContract).to.equal(pokemonCardAddress);
      expect(listing.tokenId).to.equal(0n);
      expect(listing.price).to.equal(FIXED_PRICE);
      expect(listing.saleType).to.equal(0);
      expect(listing.status).to.equal(0);
    });

    it("Should allow buying a fixed price listing", async function () {
      // Create listing
      await trading
        .connect(seller)
        .createFixedPriceListing(pokemonCardAddress, 0, FIXED_PRICE, ONE_DAY);

      // Get balances before purchase
      const sellerBalanceBefore = await ethers.provider.getBalance(
        sellerAddress
      );
      const feeRecipientBalanceBefore = await ethers.provider.getBalance(
        feeRecipientAddress
      );

      // Buy the listing
      await trading.connect(buyer).buyNow(0, { value: FIXED_PRICE });

      // Check NFT ownership
      expect(await pokemonCard.ownerOf(0)).to.equal(buyerAddress);

      // Check listing status
      const listing = await trading.getListingDetails(0);
      expect(listing.status).to.equal(1);

      // Calculate expected fee and seller amount
      const fee = (FIXED_PRICE * PLATFORM_FEE_PERCENTAGE) / 10000n;
      const sellerAmount = FIXED_PRICE - fee;

      // Check pending withdrawals
      expect(await trading.pendingWithdrawals(sellerAddress)).to.equal(
        sellerAmount
      );
      expect(await trading.pendingWithdrawals(feeRecipientAddress)).to.equal(
        fee
      );
    });

    it("Should allow seller to cancel a listing", async function () {
      // Create listing
      await trading
        .connect(seller)
        .createFixedPriceListing(pokemonCardAddress, 0, FIXED_PRICE, ONE_DAY);

      // Cancel the listing
      await trading.connect(seller).cancelListing(0);

      // Check listing status
      const listing = await trading.getListingDetails(0);
      expect(listing.status).to.equal(2);

      // Check NFT ownership (should be back to seller)
      expect(await pokemonCard.ownerOf(0)).to.equal(sellerAddress);
    });
  });

  describe("English Auction", function () {
    beforeEach(async function () {
      // Create an English auction
      await trading
        .connect(seller)
        .createEnglishAuction(pokemonCardAddress, 0, START_PRICE, ONE_DAY);
    });

    it("Should create an English auction correctly", async function () {
      const listing = await trading.getListingDetails(0);

      expect(listing.seller).to.equal(sellerAddress);
      expect(listing.price).to.equal(START_PRICE);
      expect(listing.saleType).to.equal(1);
      expect(listing.status).to.equal(0);
      expect(listing.highestBidder).to.equal(ethers.ZeroAddress);
      expect(listing.highestBid).to.equal(0n);
    });

    it("Should accept bids for an English auction", async function () {
      const bidAmount = START_PRICE;

      await trading.connect(buyer).placeBid(0, { value: bidAmount });

      const listing = await trading.getListingDetails(0);
      expect(listing.highestBidder).to.equal(buyerAddress);
      expect(listing.highestBid).to.equal(bidAmount);
    });

    it("Should reject bids below the minimum", async function () {
      const lowBid = (START_PRICE * 9n) / 10n;

      await expect(
        trading.connect(buyer).placeBid(0, { value: lowBid })
      ).to.be.revertedWith("Bid too low");
    });

    it("Should extend auction time when bid placed near the end", async function () {
      // Advance time to near the end of the auction
      const endTime = (await trading.getListingDetails(0)).endTime;
      await time.increaseTo(endTime - 240n);

      // Place a bid
      await trading.connect(buyer).placeBid(0, { value: START_PRICE });

      // Check if auction was extended
      const newEndTime = (await trading.getListingDetails(0)).endTime;
      expect(newEndTime > endTime).to.equal(true);
    });

    it("Should finalize auction correctly", async function () {
      // Place a bid
      await trading.connect(buyer).placeBid(0, { value: START_PRICE });

      // Advance time past the auction end
      const endTime = (await trading.getListingDetails(0)).endTime;
      await time.increaseTo(endTime + 1n);

      // Finalize the auction
      await trading.finalizeAuction(0);

      // Check listing status
      const listing = await trading.getListingDetails(0);
      expect(listing.status).to.equal(1);

      // Check NFT ownership
      expect(await pokemonCard.ownerOf(0)).to.equal(buyerAddress);

      // Check pending withdrawals
      const fee = (START_PRICE * PLATFORM_FEE_PERCENTAGE) / 10000n;
      const sellerAmount = START_PRICE - fee;

      expect(await trading.pendingWithdrawals(sellerAddress)).to.equal(
        sellerAmount
      );
      expect(await trading.pendingWithdrawals(feeRecipientAddress)).to.equal(
        fee
      );
    });

    it("Should return NFT to seller if no bids placed", async function () {
      // Advance time past the auction end
      const endTime = (await trading.getListingDetails(0)).endTime;
      await time.increaseTo(endTime + 1n);

      // Finalize the auction
      await trading.finalizeAuction(0);

      // Check listing status
      const listing = await trading.getListingDetails(0);
      expect(listing.status).to.equal(3);

      // Check NFT ownership (should be back to seller)
      expect(await pokemonCard.ownerOf(0)).to.equal(sellerAddress);
    });
  });

  describe("Dutch Auction", function () {
    beforeEach(async function () {
      // Create a Dutch auction
      await trading
        .connect(seller)
        .createDutchAuction(
          pokemonCardAddress,
          0,
          START_PRICE,
          END_PRICE,
          ONE_DAY
        );
    });

    it("Should create a Dutch auction correctly", async function () {
      const listing = await trading.getListingDetails(0);

      expect(listing.seller).to.equal(sellerAddress);
      expect(listing.price).to.equal(START_PRICE);
      expect(listing.endPrice).to.equal(END_PRICE);
      expect(listing.saleType).to.equal(2);
      expect(listing.status).to.equal(0);
    });

    it("Should calculate current price correctly", async function () {
      const initialCurrentPrice = await trading.getCurrentPrice(0);
      expect(initialCurrentPrice).to.equal(START_PRICE);

      // Advance time to halfway through the auction
      const listing = await trading.getListingDetails(0);
      const halfwayTime = listing.startTime + ONE_DAY / 2n;
      await time.increaseTo(halfwayTime);

      // Check that the current price is roughly halfway between start and end
      const midCurrentPrice = await trading.getCurrentPrice(0);
      const priceDifference = START_PRICE - END_PRICE;
      const expectedMidPrice = START_PRICE - priceDifference / 2n;
      const tolerance = ethers.parseEther("0.1");

      const diff =
        midCurrentPrice > expectedMidPrice
          ? midCurrentPrice - expectedMidPrice
          : expectedMidPrice - midCurrentPrice;
      expect(diff <= tolerance).to.equal(true);
    });

    it("Should allow buying at current price", async function () {
      // Advance time to halfway through the auction
      const listing = await trading.getListingDetails(0);
      const halfwayTime = listing.startTime + ONE_DAY / 2n;
      await time.increaseTo(halfwayTime);

      // Get current price
      const currentPrice = await trading.getCurrentPrice(0);

      // Buy at current price
      await trading.connect(buyer).buyNow(0, { value: currentPrice });

      // Check NFT ownership
      expect(await pokemonCard.ownerOf(0)).to.equal(buyerAddress);

      // Check listing status
      const updatedListing = await trading.getListingDetails(0);
      expect(updatedListing.status).to.equal(1);
    });

    it("Should fail to buy below current price", async function () {
      // Advance time to halfway through the auction
      const listing = await trading.getListingDetails(0);
      const halfwayTime = listing.startTime + ONE_DAY / 2n;
      await time.increaseTo(halfwayTime);

      // Get current price
      const currentPrice = await trading.getCurrentPrice(0);

      // Try to buy below current price
      const tooLow = (currentPrice * 9n) / 10n;
      await expect(
        trading.connect(buyer).buyNow(0, { value: tooLow })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawing funds", async function () {
      // Create and sell a listing
      await trading
        .connect(seller)
        .createFixedPriceListing(pokemonCardAddress, 0, FIXED_PRICE, ONE_DAY);
      await trading.connect(buyer).buyNow(0, { value: FIXED_PRICE });

      // Check pending withdrawals
      const fee = (FIXED_PRICE * PLATFORM_FEE_PERCENTAGE) / 10000n;
      const sellerAmount = FIXED_PRICE - fee;
      expect(await trading.pendingWithdrawals(sellerAddress)).to.equal(
        sellerAmount
      );

      // Get seller balance before withdrawal
      const sellerBalanceBefore = await ethers.provider.getBalance(
        sellerAddress
      );

      // Withdraw funds
      const withdrawTx = await trading.connect(seller).withdraw();
      const receipt = await withdrawTx.wait();

      // Calculate gas used
      const gasUsed = receipt.gasUsed;
      const gasPrice = withdrawTx.gasPrice;
      const gasCost = gasUsed * gasPrice;

      // Check balance after withdrawal
      const sellerBalanceAfter = await ethers.provider.getBalance(
        sellerAddress
      );
      const expectedBalance = sellerBalanceBefore + sellerAmount - gasCost;
      expect(sellerBalanceAfter).to.equal(expectedBalance);

      // Pending withdrawal should be zero
      expect(await trading.pendingWithdrawals(sellerAddress)).to.equal(0n);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to set platform fee", async function () {
      const newFee = 200n;
      await trading.connect(owner).setPlatformFeePercentage(newFee);
      expect(await trading.platformFeePercentage()).to.equal(newFee);
    });

    it("Should allow admin to set fee recipient", async function () {
      await trading.connect(owner).setFeeRecipient(buyerAddress);
      expect(await trading.feeRecipient()).to.equal(buyerAddress);
    });

    it("Should allow admin to pause and unpause the contract", async function () {
      await trading.connect(owner).pause();
      expect(await trading.paused()).to.equal(true);

      // Should not allow creating listings while paused
      await expect(
        trading
          .connect(seller)
          .createFixedPriceListing(pokemonCardAddress, 0, FIXED_PRICE, ONE_DAY)
      ).to.be.reverted;

      // Unpause
      await trading.connect(owner).unpause();
      expect(await trading.paused()).to.equal(false);

      // Should now allow creating listings
      await trading
        .connect(seller)
        .createFixedPriceListing(pokemonCardAddress, 0, FIXED_PRICE, ONE_DAY);
      const listing = await trading.getListingDetails(0);
      expect(listing.price).to.equal(FIXED_PRICE);
    });
  });
});
