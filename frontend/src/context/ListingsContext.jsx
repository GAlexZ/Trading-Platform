import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";

// Create context
const ListingsContext = createContext();

export const useListings = () => useContext(ListingsContext);

export const ListingsProvider = ({ children }) => {
  const { tradingContract, pokemonCardContract, account } = useWeb3();

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

  // Fetch all active listings
  const fetchListings = async () => {
    if (!tradingContract) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use events or a backend indexer
      // For simplicity, we'll use a counter-based approach with mock data

      const nextListingId = await tradingContract.callStatic._nextListingId();
      const listingsData = [];

      for (let i = 0; i < nextListingId; i++) {
        try {
          const listing = await tradingContract.callStatic.getListingDetails(i);

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

          // Skip non-active listings
          if (statusMap[status] !== "Active") continue;

          // Get NFT metadata from PokemonCard contract
          let metadata = {};

          try {
            if (
              nftContract.toLowerCase() ===
              pokemonCardContract?.address?.toLowerCase()
            ) {
              const pokemonData =
                await pokemonCardContract.callStatic.getPokemonDetails(tokenId);

              metadata = {
                name: pokemonData.name,
                generation: pokemonData.generation,
                type: pokemonData.pokemonType,
                power: pokemonData.power,
                rarity: pokemonData.rarity,
                isShiny: pokemonData.isShiny,
              };

              // Get token URI for image
              //const tokenURI = await pokemonCardContract.callStatic.tokenURI(
              //tokenId
              //);

              // In a real app, you would fetch this data from IPFS
              // For demo, we'll use a placeholder
              metadata.image = `/api/placeholder/300/400`;
            }
          } catch (err) {
            console.warn(`Failed to get metadata for listing ${i}:`, err);
            // Use placeholder metadata
            metadata = {
              name: `Pokemon #${tokenId}`,
              generation: 1,
              type: "Unknown",
              power: 100,
              rarity: 3,
              isShiny: false,
              image: `/api/placeholder/300/400`,
            };
          }

          // Format the listing data
          listingsData.push({
            id: i,
            seller,
            nftContract,
            tokenId: tokenId.toString(),
            price: ethers.utils.formatEther(price),
            endPrice: ethers.utils.formatEther(endPrice),
            startTime: new Date(startTime.toNumber() * 1000),
            endTime: new Date(endTime.toNumber() * 1000),
            highestBidder,
            highestBid: ethers.utils.formatEther(highestBid),
            saleType: saleTypeMap[saleType],
            status: statusMap[status],
            currentPrice: ethers.utils.formatEther(currentPrice),
            ...metadata,
          });
        } catch (err) {
          console.warn(`Failed to get listing ${i}:`, err);
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
      // Filter listings by seller == current account
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
      // In a real implementation, you would use events or a backend indexer
      // For this demo, we'll use mock data first, then enhance with real data

      // Mock NFT data
      const mockNFTs = [
        {
          id: 101,
          name: "Pikachu",
          generation: 1,
          type: "Electric",
          power: 120,
          rarity: 3,
          isShiny: true,
          image: "/api/placeholder/300/400",
        },
        {
          id: 102,
          name: "Mew",
          generation: 1,
          type: "Psychic",
          power: 170,
          rarity: 5,
          isShiny: false,
          image: "/api/placeholder/300/400",
        },
        {
          id: 103,
          name: "Dragonite",
          generation: 1,
          type: "Dragon",
          power: 160,
          rarity: 4,
          isShiny: false,
          image: "/api/placeholder/300/400",
        },
      ];

      setUserNFTs(mockNFTs);

      // In a real implementation, you would scan for the user's NFTs like this:
      // Get the total number of NFTs owned by the user
      // const balance = await pokemonCardContract.balanceOf(account);
      // const nfts = [];

      // for (let i = 0; i < balance; i++) {
      //   const tokenId = await pokemonCardContract.tokenOfOwnerByIndex(account, i);
      //   const pokemonData = await pokemonCardContract.getPokemonDetails(tokenId);
      //   const tokenURI = await pokemonCardContract.tokenURI(tokenId);
      //
      //   nfts.push({
      //     id: tokenId.toString(),
      //     name: pokemonData.name,
      //     generation: pokemonData.generation,
      //     type: pokemonData.pokemonType,
      //     power: pokemonData.power,
      //     rarity: pokemonData.rarity,
      //     isShiny: pokemonData.isShiny,
      //     image: tokenURI // In a real app, you would parse this from IPFS
      //   });
      // }
      //
      // setUserNFTs(nfts);
    } catch (err) {
      console.error("Error fetching user NFTs:", err);
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

    const listingCreatedHandler = (
      listingId,
      seller,
      nftContract,
      tokenId,
      price,
      saleType
    ) => {
      console.log("Listing created:", {
        listingId,
        seller,
        nftContract,
        tokenId,
        price,
        saleType,
      });
      // Refresh listings
      fetchListings();
    };

    const listingSoldHandler = (listingId, buyer, price) => {
      console.log("Listing sold:", { listingId, buyer, price });
      // Refresh listings
      fetchListings();
    };

    const listingCancelledHandler = (listingId) => {
      console.log("Listing cancelled:", { listingId });
      // Refresh listings
      fetchListings();
    };

    const bidPlacedHandler = (listingId, bidder, amount) => {
      console.log("Bid placed:", { listingId, bidder, amount });
      // Refresh listings
      fetchListings();
    };

    // Set up event listeners
    tradingContract.on("ListingCreated", listingCreatedHandler);
    tradingContract.on("ListingSold", listingSoldHandler);
    tradingContract.on("ListingCancelled", listingCancelledHandler);
    tradingContract.on("BidPlaced", bidPlacedHandler);

    // Cleanup event listeners
    return () => {
      tradingContract.off("ListingCreated", listingCreatedHandler);
      tradingContract.off("ListingSold", listingSoldHandler);
      tradingContract.off("ListingCancelled", listingCancelledHandler);
      tradingContract.off("BidPlaced", bidPlacedHandler);
    };
  }, [tradingContract]);

  // Fetch listings when contract is available
  useEffect(() => {
    if (tradingContract) {
      fetchListings();
    }
  }, [tradingContract]);

  // Fetch user-specific data when account is available
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
