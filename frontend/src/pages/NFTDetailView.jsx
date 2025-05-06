import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  ArrowUpDown,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { useListings } from "../context/ListingsContext";
import { useWeb3 } from "../context/Web3Context";
import { resolveIPFS, createPlaceholder } from "../utils/ipfsHelper";
import IPFSImage from "../components/IPFSImage";

const NFTDetailView = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { getListing, fetchListings } = useListings();
  const { account, buyNow, placeBid, finalizeAuction, cancelListing } =
    useWeb3();

  // Get listing details
  const listing = getListing(listingId);

  // Component state
  const [bidAmount, setBidAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });
  // Track if purchase was successful
  const [purchaseSuccessful, setPurchaseSuccessful] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);

  // Get image URL with proper IPFS handling
  const getImageUrl = () => {
    // Check if we have a tokenURI to use
    if (listing?.tokenURI) {
      return resolveIPFS(listing.tokenURI);
    }

    // If we have an image property, use that
    if (listing?.image) {
      // It might already be resolved, but use resolveIPFS to be sure
      return resolveIPFS(listing.image);
    }

    // Fallback to placeholder
    return createPlaceholder(listing?.name || "Pokemon");
  };

  // Check if the current user is the seller of this listing
  const isSeller =
    account && listing?.seller?.toLowerCase() === account.toLowerCase();

  // Handle going back to marketplace
  const handleBack = () => {
    navigate("/marketplace");
  };

  // Calculate time remaining for auctions
  const calculateTimeRemaining = useCallback(() => {
    if (!listing || !listing.endTime) return;

    const now = new Date();
    const endTime = new Date(listing.endTime);
    const total = endTime - now;

    if (total <= 0) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      });
      return;
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    setCountdown({
      days,
      hours,
      minutes,
      seconds,
      expired: false,
    });
  }, [listing]);

  // Update countdown timer
  useEffect(() => {
    calculateTimeRemaining();

    if (
      listing &&
      (listing.saleType === "EnglishAuction" ||
        listing.saleType === "DutchAuction")
    ) {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [listing, calculateTimeRemaining]);

  // Get current price for Dutch auction
  const getCurrentPrice = useCallback(() => {
    if (!listing || listing.saleType !== "DutchAuction") {
      return listing?.currentPrice || listing?.price;
    }

    const now = new Date();
    const startTime = new Date(listing.startTime);
    const endTime = new Date(listing.endTime);

    // If auction has ended, return end price
    if (now >= endTime) {
      return listing.endPrice;
    }

    // If auction hasn't started yet, return start price
    if (now <= startTime) {
      return listing.price;
    }

    // Calculate current price based on linear decrease
    const totalDuration = endTime - startTime;
    const timeElapsed = now - startTime;
    const priceDifference =
      parseFloat(listing.price) - parseFloat(listing.endPrice);

    // Linear price decrease
    const currentPrice =
      parseFloat(listing.price) -
      (priceDifference * timeElapsed) / totalDuration;

    return currentPrice.toFixed(4);
  }, [listing]);

  // Format price with ETH symbol
  const formatPrice = (price) => {
    return `${price} ETH`;
  };

  // Get icon and color based on sale type
  const getSaleTypeInfo = (saleType) => {
    switch (saleType) {
      case "FixedPrice":
        return {
          icon: <Tag className="h-5 w-5" />,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      case "EnglishAuction":
        return {
          icon: <ArrowUpDown className="h-5 w-5" />,
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "DutchAuction":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }
  };

  // Handle bid/buy action
  const handleAction = () => {
    if (!account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    if (isSeller) {
      setErrorMessage("You cannot buy or bid on your own listing");
      return;
    }

    if (listing.saleType === "EnglishAuction") {
      if (!bidAmount || parseFloat(bidAmount) <= 0) {
        setErrorMessage("Please enter a valid bid amount");
        return;
      }

      // Minimum bid is 5% higher than current price
      const minBid =
        parseFloat(listing.highestBid) > 0
          ? parseFloat(listing.highestBid) * 1.05
          : parseFloat(listing.price);

      if (parseFloat(bidAmount) < minBid) {
        setErrorMessage(`Bid must be at least ${minBid.toFixed(4)} ETH`);
        return;
      }
    }

    setErrorMessage("");
    setShowConfirmation(true);
  };

  // Handle cancel listing
  const handleCancelListing = () => {
    if (!account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    if (!isSeller) {
      setErrorMessage("Only the seller can cancel this listing");
      return;
    }

    if (
      listing.saleType === "EnglishAuction" &&
      parseFloat(listing.highestBid) > 0
    ) {
      setErrorMessage("Cannot cancel an auction with active bids");
      return;
    }

    setErrorMessage("");
    setShowConfirmation(true);
  };

  // Handle finalize auction
  const handleFinalizeAuction = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    if (!countdown.expired) {
      setErrorMessage("Auction has not ended yet");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const result = await finalizeAuction(listingId);

      if (result.success) {
        setSuccessMessage("Auction has been finalized successfully!");
        fetchListings(); // Refresh listings
      } else {
        setErrorMessage(result.error || "Failed to finalize auction");
      }
    } catch (error) {
      setErrorMessage("An error occurred while finalizing the auction");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm action (buy or bid)
  const confirmAction = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      let result;

      if (listing.saleType === "EnglishAuction") {
        // Place bid
        result = await placeBid(listingId, bidAmount);
      } else {
        // Buy now (Fixed Price or Dutch Auction)
        const price =
          listing.saleType === "DutchAuction"
            ? getCurrentPrice()
            : listing.price;
        result = await buyNow(listingId, price);

        // If purchase was successful, store details
        if (result.success) {
          setPurchaseSuccessful(true);
          setPurchaseDetails({
            name: listing.name,
            price: price,
            saleType: listing.saleType,
            image: listing.image || listing.tokenURI,
            seller: listing.seller,
            tokenId: listing.tokenId,
          });
        }
      }

      if (result.success) {
        setSuccessMessage(
          listing.saleType === "EnglishAuction"
            ? `Bid of ${bidAmount} ETH placed successfully!`
            : "Purchase completed successfully!"
        );
        fetchListings(); // Refresh listings
      } else {
        setErrorMessage(result.error || "Transaction failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred during the transaction");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm cancel listing
  const confirmCancelListing = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      const result = await cancelListing(listingId);

      if (result.success) {
        setSuccessMessage("Listing cancelled successfully!");
        fetchListings(); // Refresh listings
      } else {
        setErrorMessage(result.error || "Failed to cancel listing");
      }
    } catch (error) {
      setErrorMessage("An error occurred while cancelling the listing");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // If purchase was successful, show the purchase summary
  if (purchaseSuccessful && purchaseDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to marketplace</span>
            </button>
          </div>

          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Purchase Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Congratulations! You have successfully purchased this NFT.
            </p>

            <div className="max-w-md mx-auto mb-8 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <IPFSImage
                  uri={purchaseDetails.image}
                  alt={purchaseDetails.name}
                  fallbackText={purchaseDetails.name}
                  containerStyle={{ height: "200px", width: "200px" }}
                  className="card-grid"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {purchaseDetails.name}
              </h3>
              <div className="mb-4">
                <span className="block text-sm text-gray-500">Price Paid:</span>
                <span className="text-lg font-medium text-gray-900">
                  {formatPrice(purchaseDetails.price)}
                </span>
              </div>
              <div className="mb-2">
                <span className="block text-sm text-gray-500">Token ID:</span>
                <span className="text-gray-900">{purchaseDetails.tokenId}</span>
              </div>
              <div className="mb-2">
                <span className="block text-sm text-gray-500">
                  Purchased From:
                </span>
                <span className="text-gray-900 break-all">
                  {purchaseDetails.seller}
                </span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/collection")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View My Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If listing not found
  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to marketplace</span>
          </button>

          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Listing not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go back to marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const saleTypeInfo = getSaleTypeInfo(listing.saleType);
  const currentPrice =
    listing.saleType === "DutchAuction" ? getCurrentPrice() : listing.price;
  const isAuctionEnded =
    (listing.saleType === "EnglishAuction" ||
      listing.saleType === "DutchAuction") &&
    countdown.expired;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Back button */}
        <div className="p-4 border-b">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to marketplace</span>
          </button>
        </div>

        {/* Main content */}
        <div className="md:flex">
          {/* Left - Image */}
          <div className="md:w-1/2">
            <div className="relative p-4">
              {/* Replace the img tag with our IPFSImage component */}
              <IPFSImage
                uri={listing.tokenURI || listing.image}
                alt={listing.name}
                isDetail={true}
                fallbackText={listing.name || "Pokemon"}
                containerStyle={{
                  height: "400px",
                  maxWidth: "100%",
                  margin: "0 auto",
                }}
              />

              {listing.isShiny && (
                <span className="absolute top-6 right-6 px-3 py-1 bg-yellow-400 text-yellow-800 text-sm font-medium rounded-md">
                  ✨ Shiny
                </span>
              )}

              {listing.tokenURI && (
                <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                  <a
                    href={resolveIPFS(listing.tokenURI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:text-indigo-600"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Original
                  </a>
                </div>
              )}
            </div>
          </div>
          {/* Right - Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <span
                className={`${saleTypeInfo.bgColor} ${saleTypeInfo.color} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`}
              >
                {saleTypeInfo.icon}
                <span className="ml-1">{listing.saleType}</span>
              </span>

              {isAuctionEnded && (
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Auction Ended
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {listing.name}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                Gen {listing.generation}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                {listing.type}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800">
                Power: {listing.power}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800">
                {"⭐".repeat(listing.rarity)}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Seller:{" "}
                {`${listing.seller.substring(
                  0,
                  6
                )}...${listing.seller.substring(listing.seller.length - 4)}`}
              </p>

              {/* Current price section */}
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">
                  {listing.saleType === "EnglishAuction"
                    ? "Current Bid"
                    : listing.saleType === "DutchAuction"
                    ? "Current Price"
                    : "Price"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </p>

                {listing.saleType === "EnglishAuction" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum bid:{" "}
                    {formatPrice(
                      parseFloat(listing.highestBid) > 0
                        ? (parseFloat(listing.highestBid) * 1.05).toFixed(4)
                        : listing.price
                    )}
                  </p>
                )}

                {listing.saleType === "EnglishAuction" &&
                  listing.highestBidder && (
                    <p className="text-sm text-gray-500 mt-1">
                      Highest bidder:{" "}
                      {`${listing.highestBidder.substring(
                        0,
                        6
                      )}...${listing.highestBidder.substring(
                        listing.highestBidder.length - 4
                      )}`}
                    </p>
                  )}
              </div>

              {/* Auction countdown */}
              {(listing.saleType === "EnglishAuction" ||
                listing.saleType === "DutchAuction") && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {countdown.expired
                      ? "Auction has ended"
                      : "Auction ends in:"}
                  </p>

                  {!countdown.expired && (
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <span className="block text-2xl font-bold">
                          {countdown.days}
                        </span>
                        <span className="text-xs text-gray-500">Days</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold">
                          {countdown.hours}
                        </span>
                        <span className="text-xs text-gray-500">Hours</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold">
                          {countdown.minutes}
                        </span>
                        <span className="text-xs text-gray-500">Mins</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold">
                          {countdown.seconds}
                        </span>
                        <span className="text-xs text-gray-500">Secs</span>
                      </div>
                    </div>
                  )}

                  {/* Finalize auction button (for ended auctions) */}
                  {isAuctionEnded && listing.saleType === "EnglishAuction" && (
                    <div className="mt-4">
                      <button
                        onClick={handleFinalizeAuction}
                        disabled={isProcessing}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isProcessing ? "Processing..." : "Finalize Auction"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dutch auction price explanation */}
              {listing.saleType === "DutchAuction" && !countdown.expired && (
                <div className="bg-orange-50 p-3 rounded-md mb-6 flex items-center">
                  <Info className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-orange-700">
                    This is a Dutch auction - the price decreases over time from{" "}
                    {formatPrice(listing.price)} to{" "}
                    {formatPrice(listing.endPrice)} until someone purchases the
                    item or the auction ends.
                  </p>
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 p-3 rounded-md mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Bid input for English auction */}
            {listing.saleType === "EnglishAuction" &&
              !successMessage &&
              !countdown.expired &&
              !isSeller && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Bid (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter bid amount"
                    disabled={isProcessing}
                  />
                </div>
              )}

            {/* Action buttons */}
            {!successMessage && (
              <div className="space-y-3">
                {/* Conditional rendering of either Buy/Bid button or Cancel button based on whether user is seller */}
                {isSeller ? (
                  <button
                    onClick={handleCancelListing}
                    disabled={
                      isProcessing ||
                      isAuctionEnded ||
                      (listing.saleType === "EnglishAuction" &&
                        parseFloat(listing.highestBid) > 0)
                    }
                    className="w-full bg-red-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Cancel Listing"}
                  </button>
                ) : (
                  !isAuctionEnded && (
                    <button
                      onClick={handleAction}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isProcessing
                        ? "Processing..."
                        : listing.saleType === "EnglishAuction"
                        ? "Place Bid"
                        : "Buy Now"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation modal - Updated to handle both buying/bidding and cancellation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isSeller
                      ? "Confirm Cancellation"
                      : `Confirm ${
                          listing.saleType === "EnglishAuction"
                            ? "Bid"
                            : "Purchase"
                        }`}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {isSeller
                        ? "Are you sure you want to cancel this listing? The NFT will be returned to your wallet."
                        : listing.saleType === "EnglishAuction"
                        ? `Are you sure you want to place a bid of ${bidAmount} ETH for ${listing.name}?`
                        : `Are you sure you want to purchase ${
                            listing.name
                          } for ${formatPrice(currentPrice)}?`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={isSeller ? confirmCancelListing : confirmAction}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTDetailView;
