// frontend/src/context/ListingsContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";
import { resolveIPFS } from "../utils/ipfsHelper";
import contractAddresses from "../contract-addresses.json";

// Create context
const ListingsContext = createContext();

export const useListings = () => useContext(ListingsContext);

export const ListingsProvider = ({ children }) => {
  const {
    tradingContract,
    pokemonCardContract,
    fetchMyPokemonCards,
    account,
    provider,
  } = useWeb3();

  const [listings, setListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sale types enum mapping
  const saleTypeMap = {
    0: "FixedPrice",
    1: "EnglishAuction",
    2: "DutchAuction",
  };

  // Status enum mapping
  const statusMap = {
    0: "Active",
    1: "Sold",
    2: "Cancelled",
    3: "Expired",
  };

  // Create a read-only provider for public RPC access when wallet not connected
  const getReadOnlyProvider = () => {
    // Use the existing provider if available
    if (provider) return provider;

    // Otherwise create a new read-only provider
    // You should replace this URL with your network's RPC URL
    return new ethers.providers.JsonRpcProvider("http://localhost:8545");
  };

  // Get read-only contract instances
  const getReadOnlyContracts = () => {
    const readProvider = getReadOnlyProvider();

    // Contract addresses should match the ones in Web3Context.jsx
    const TRADING_CONTRACT_ADDRESS = contractAddresses.trading;
    const POKEMON_CARD_CONTRACT_ADDRESS = contractAddresses.pokemonCard;

    // Create contract instances with ABI
    const tradingABI = require("../contracts/Trading.json").abi;
    const pokemonCardABI = require("../contracts/PokemonCard.json").abi;

    const tradingContractRO = new ethers.Contract(
      TRADING_CONTRACT_ADDRESS,
      tradingABI,
      readProvider
    );

    const pokemonCardContractRO = new ethers.Contract(
      POKEMON_CARD_CONTRACT_ADDRESS,
      pokemonCardABI,
      readProvider
    );

    return { tradingContractRO, pokemonCardContractRO };
  };

  // Enhanced fetchListings function for ListingsContext.jsx
  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get contracts - use connected ones if available, otherwise use read-only
      let tradingContractToUse = tradingContract;
      let pokemonCardContractToUse = pokemonCardContract;

      // If no connected contracts, use read-only ones
      if (!tradingContractToUse || !pokemonCardContractToUse) {
        const { tradingContractRO, pokemonCardContractRO } =
          getReadOnlyContracts();
        tradingContractToUse = tradingContractRO;
        pokemonCardContractToUse = pokemonCardContractRO;
      }

      if (!tradingContractToUse || !pokemonCardContractToUse) {
        throw new Error("Unable to initialize contracts");
      }

      // Get next listing ID (total number of listings created)
      const nextListingId =
        await tradingContractToUse.callStatic._nextListingId();
      const listingsData = [];

      // For efficient batch processing, collect IDs of active listings first
      const activeListingIds = [];
      const tokenIds = [];

      // First pass: get listing status and collect active listings
      for (let i = 0; i < nextListingId; i++) {
        try {
          const listing =
            await tradingContractToUse.callStatic.getListingDetails(i);

          // Skip non-active listings
          if (statusMap[listing[10]] !== "Active") continue;

          activeListingIds.push(i);

          // If this is a Pokemon card NFT, add its token ID to our batch request list
          if (
            listing[1].toLowerCase() ===
            pokemonCardContractToUse?.address?.toLowerCase()
          ) {
            tokenIds.push(listing[2].toString());
          }
        } catch (err) {
          console.warn(`Failed to get listing ${i}:`, err);
        }
      }

      // If no active listings, return early
      if (activeListingIds.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }

      // Batch get Pokemon metadata for all token IDs at once
      let pokemonDetailsMap = {};
      let tokenURIsMap = {};

      if (tokenIds.length > 0) {
        try {
          const pokemonBatch =
            await pokemonCardContractToUse.callStatic.batchGetPokemonDetails(
              tokenIds
            );

          // Get tokenURIs for all Pokemon cards
          const tokenURIs = await Promise.all(
            tokenIds.map((id) => pokemonCardContractToUse.tokenURI(id))
          );

          // Create a map of token ID to Pokemon details
          tokenIds.forEach((id, index) => {
            tokenURIsMap[id] = tokenURIs[index];
            pokemonDetailsMap[id] = {
              name: pokemonBatch[index].name,
              generation: pokemonBatch[index].generation,
              type: pokemonBatch[index].pokemonType,
              power: pokemonBatch[index].power,
              rarity: pokemonBatch[index].rarity,
              isShiny: pokemonBatch[index].isShiny,
              // Use the token URI as the image source, properly resolved
              image: resolveIPFS(tokenURIs[index]),
            };
          });
        } catch (err) {
          console.warn("Failed to batch get Pokemon details:", err);
        }
      }

      // Second pass: process active listings with Pokemon metadata
      for (const listingId of activeListingIds) {
        try {
          const listing =
            await tradingContractToUse.callStatic.getListingDetails(listingId);

          // Destructure listing details
          const [
            seller,
            nftContract,
            tokenId,
            price,
            endPrice,
            startTime,
            endTime,
            highestBidder,
            highestBid,
            saleType,
            status,
            currentPrice,
          ] = listing;

          // Get the token ID as string
          const tokenIdStr = tokenId.toString();

          // Get metadata either from our batch result or use a placeholder
          const metadata = pokemonDetailsMap[tokenIdStr] || {
            name: `Pokemon #${tokenIdStr}`,
            generation: 1,
            type: "Unknown",
            power: 100,
            rarity: 3,
            isShiny: false,
            image: `ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa?text=${encodeURIComponent(
              `Pokemon #${tokenIdStr}`
            )}`,
          };

          // Format the listing data
          listingsData.push({
            id: listingId,
            seller,
            nftContract,
            tokenId: tokenIdStr,
            price: ethers.utils.formatEther(price),
            endPrice: ethers.utils.formatEther(endPrice),
            startTime: new Date(startTime.toNumber() * 1000),
            endTime: new Date(endTime.toNumber() * 1000),
            highestBidder,
            highestBid: ethers.utils.formatEther(highestBid),
            saleType: saleTypeMap[saleType],
            status: statusMap[status],
            currentPrice: ethers.utils.formatEther(currentPrice),
            tokenURI: tokenURIsMap[tokenIdStr] || null,
            ...metadata,
          });
        } catch (err) {
          console.warn(`Failed to process listing ${listingId}:`, err);
        }
      }

      setListings(listingsData);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to fetch listings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's listings
  const fetchUserListings = async () => {
    if (!tradingContract || !account) return;

    try {
      const userListingsData = listings.filter(
        (listing) => listing.seller.toLowerCase() === account.toLowerCase()
      );

      setUserListings(userListingsData);
    } catch (err) {
      console.error("Error fetching user listings:", err);
    }
  };

  // Fetch user's NFTs
  const fetchUserNFTs = async () => {
    if (!pokemonCardContract || !account) return;
    try {
      const { success, cards, error } = await fetchMyPokemonCards();
      if (success) {
        setUserNFTs(cards);
      } else {
        console.error("Error fetching user NFTs:", error);
        setUserNFTs([]);
      }
    } catch (err) {
      console.error("Error fetching user NFTs:", err);
      setUserNFTs([]);
    }
  };

  // Get a single listing by ID
  const getListing = (listingId) => {
    return listings.find(
      (listing) => listing.id.toString() === listingId.toString()
    );
  };

  // Listen for contract events
  useEffect(() => {
    if (!tradingContract) return;

    const listingCreatedHandler = () => {
      fetchListings();
    };

    const listingSoldHandler = (listingId, buyer, price) => {
      fetchListings();
    };

    const listingCancelledHandler = (listingId) => {
      console.log("Listing cancelled:", { listingId });
      fetchListings();
    };

    const bidPlacedHandler = (listingId, bidder, amount) => {
      console.log("Bid placed:", { listingId, bidder, amount });
      fetchListings();
    };

    tradingContract.on("ListingCreated", listingCreatedHandler);
    tradingContract.on("ListingSold", listingSoldHandler);
    tradingContract.on("ListingCancelled", listingCancelledHandler);
    tradingContract.on("BidPlaced", bidPlacedHandler);

    return () => {
      tradingContract.off("ListingCreated", listingCreatedHandler);
      tradingContract.off("ListingSold", listingSoldHandler);
      tradingContract.off("ListingCancelled", listingCancelledHandler);
      tradingContract.off("BidPlaced", bidPlacedHandler);
    };
  }, [tradingContract]);

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Fetch user-specific data when account or listings change
  useEffect(() => {
    if (account) {
      fetchUserListings();
      fetchUserNFTs();
    } else {
      setUserListings([]);
      setUserNFTs([]);
    }
  }, [account, listings]);

  // Context value
  const value = {
    listings,
    userListings,
    userNFTs,
    isLoading,
    error,
    getListing,
    fetchListings,
    fetchUserListings,
    fetchUserNFTs,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};

export default ListingsContext;
