import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  ArrowUpDown,
  Clock,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useListings } from "../context/ListingsContext";
import IPFSImage from "../components/IPFSImage";

const CreateListingPage = () => {
  const navigate = useNavigate();
  const {
    account,
    connectWallet,
    pokemonCardContract,
    createFixedPriceListing,
    createEnglishAuction,
    createDutchAuction,
  } = useWeb3();
  const { userNFTs, fetchUserNFTs } = useListings();

  // Component state
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [saleType, setSaleType] = useState("FixedPrice");
  const [price, setPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [duration, setDuration] = useState("86400"); // 1 day in seconds
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch user's NFTs when component mounts
  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    }
  }, [account, fetchUserNFTs]);

  // Helper for duration options
  const getDurationOptions = () => {
    switch (saleType) {
      case "FixedPrice":
        return [
          { value: "3600", label: "1 hour" },
          { value: "86400", label: "1 day" },
          { value: "604800", label: "1 week" },
          { value: "2592000", label: "30 days" },
        ];
      case "EnglishAuction":
        return [
          { value: "86400", label: "1 day" },
          { value: "259200", label: "3 days" },
          { value: "604800", label: "1 week" },
          { value: "1209600", label: "2 weeks" },
        ];
      case "DutchAuction":
        return [
          { value: "3600", label: "1 hour" },
          { value: "21600", label: "6 hours" },
          { value: "86400", label: "1 day" },
          { value: "604800", label: "7 days" },
        ];
      default:
        return [{ value: "86400", label: "1 day" }];
    }
  };

  // Convert duration to readable format
  const formatDuration = (seconds) => {
    const hours = seconds / 3600;
    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    const days = hours / 24;
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  // Handle going back to marketplace
  const handleBack = () => {
    navigate("/marketplace");
  };

  // Validate form before creating listing
  const validateForm = () => {
    if (!account) {
      setErrorMessage("Please connect your wallet first");
      return false;
    }

    if (!selectedNFT) {
      setErrorMessage("Please select an NFT to list");
      return false;
    }

    if (!price || parseFloat(price) <= 0) {
      setErrorMessage("Please enter a valid price");
      return false;
    }

    if (saleType === "DutchAuction") {
      if (!endPrice || parseFloat(endPrice) <= 0) {
        setErrorMessage("Please enter a valid end price for Dutch auction");
        return false;
      }

      if (parseFloat(endPrice) >= parseFloat(price)) {
        setErrorMessage(
          "End price must be lower than starting price for Dutch auction"
        );
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  // Handle create listing button click
  const handleCreateListing = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  // Confirm and create listing
  const confirmCreateListing = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      let result;

      // Convert prices to wei
      //const priceInWei = ethers.utils.parseEther(price);
      //const endPriceInWei =
      //saleType === "DutchAuction" ? ethers.utils.parseEther(endPrice) : 0;

      // Call the appropriate contract function based on sale type
      switch (saleType) {
        case "FixedPrice":
          result = await createFixedPriceListing(
            pokemonCardContract.address,
            selectedNFT.id,
            price,
            parseInt(duration)
          );
          break;
        case "EnglishAuction":
          result = await createEnglishAuction(
            pokemonCardContract.address,
            selectedNFT.id,
            price,
            parseInt(duration)
          );
          break;
        case "DutchAuction":
          result = await createDutchAuction(
            pokemonCardContract.address,
            selectedNFT.id,
            price,
            endPrice,
            parseInt(duration)
          );
          break;
        default:
          throw new Error("Invalid sale type");
      }

      if (result.success) {
        setSuccessMessage(
          `Your ${selectedNFT.name} has been listed successfully!`
        );

        // Reset form
        setSelectedNFT(null);
        setPrice("");
        setEndPrice("");
        setSaleType("FixedPrice");
        setDuration("86400");
      } else {
        setErrorMessage(result.error || "Failed to create listing");
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the listing");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // If wallet not connected, show connect wallet prompt
  if (!account) {
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
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Connect your wallet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please connect your wallet to create a new listing.
            </p>
            <div className="mt-6">
              <button
                onClick={connectWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with back button */}
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
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Listing
          </h1>

          {successMessage ? (
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSuccessMessage("");
                    fetchUserNFTs(); // Refresh NFTs
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Another Listing
                </button>
                <button
                  onClick={handleBack}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Error message */}
              {errorMessage && (
                <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Step 1: Select NFT */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  1. Select a Pokemon Card
                </h2>

                {userNFTs.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          No NFTs Found
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            You don't have any Pokemon Card NFTs in your wallet
                            yet. Please mint or purchase some Pokemon Cards
                            before creating a listing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userNFTs.map((nft) => (
                      <div
                        key={nft.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedNFT?.id === nft.id
                            ? "ring-2 ring-indigo-500"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <div className="relative">
                          <div className="relative">
                            <IPFSImage
                              uri={nft.tokenURI || nft.image}
                              alt={nft.name}
                              fallbackText={nft.name || "Pokemon"}
                              className="card-grid"
                              containerStyle={{ height: "130px" }} // Maintain the height similar to original
                            />
                            {nft.isShiny && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-800 text-xs font-medium rounded-md">
                                ✨ Shiny
                              </span>
                            )}
                          </div>
                          {nft.isShiny && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-800 text-xs font-medium rounded-md">
                              ✨ Shiny
                            </span>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="font-medium text-gray-900">
                            {nft.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Gen {nft.generation}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {nft.type}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              {"⭐".repeat(nft.rarity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Select sale type */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  2. Select Sale Type
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      saleType === "FixedPrice"
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSaleType("FixedPrice")}
                  >
                    <div className="flex items-center mb-2">
                      <Tag className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Fixed Price</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Set a fixed price and sell instantly to the first buyer.
                    </p>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      saleType === "EnglishAuction"
                        ? "bg-green-50 border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSaleType("EnglishAuction")}
                  >
                    <div className="flex items-center mb-2">
                      <ArrowUpDown className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-medium text-gray-900">
                        English Auction
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Start with a minimum price and accept increasing bids
                      until the auction ends.
                    </p>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      saleType === "DutchAuction"
                        ? "bg-orange-50 border-orange-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSaleType("DutchAuction")}
                  >
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-orange-600 mr-2" />
                      <h3 className="font-medium text-gray-900">
                        Dutch Auction
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Start with a high price that gradually decreases until
                      someone buys.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Price and duration */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  3. Set Price and Duration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {saleType === "EnglishAuction"
                        ? "Starting Price (ETH)"
                        : saleType === "DutchAuction"
                        ? "Starting Price (ETH)"
                        : "Price (ETH)"}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">ETH</span>
                      </div>
                    </div>
                  </div>

                  {saleType === "DutchAuction" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Price (ETH)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={endPrice}
                          onChange={(e) => setEndPrice(e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">ETH</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        End price must be lower than starting price.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {getDurationOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Information box for each sale type */}
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-md flex items-start">
                  <HelpCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {saleType === "FixedPrice"
                        ? "About Fixed Price Listings"
                        : saleType === "EnglishAuction"
                        ? "About English Auctions"
                        : "About Dutch Auctions"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {saleType === "FixedPrice"
                        ? "Fixed price listings allow buyers to purchase your NFT immediately at the set price. The listing will remain active until someone buys it or until the duration expires."
                        : saleType === "EnglishAuction"
                        ? "English auctions start at your minimum price and allow buyers to place increasingly higher bids. The highest bidder at the end of the auction wins the NFT. If no bids are placed, the NFT returns to you."
                        : "Dutch auctions start at a high price and gradually decrease to your set end price over the duration. The first buyer to purchase at the current price wins the NFT."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create listing button */}
              <div className="mt-8">
                <button
                  onClick={handleCreateListing}
                  disabled={isProcessing || userNFTs.length === 0}
                  className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Create Listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Listing
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You are about to list your{" "}
                      <strong>{selectedNFT?.name}</strong> for sale as a{" "}
                      {saleType}{" "}
                      {saleType === "EnglishAuction" ? "auction" : "listing"}.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Sale type:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {saleType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          {saleType === "EnglishAuction"
                            ? "Starting price:"
                            : saleType === "DutchAuction"
                            ? "Starting price:"
                            : "Price:"}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {price} ETH
                        </span>
                      </div>
                      {saleType === "DutchAuction" && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            End price:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {endPrice} ETH
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={confirmCreateListing}
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

export default CreateListingPage;
