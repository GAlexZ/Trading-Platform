import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import TradingABI from "../contracts/Trading.json";
import PokemonCardABI from "../contracts/PokemonCard.json";

// Contract addresses (would come from environment variables in a real app)
const TRADING_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const POKEMON_CARD_CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create context
const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tradingContract, setTradingContract] = useState(null);
  const [pokemonCardContract, setPokemonCardContract] = useState(null);

  // Initialize contracts with provider/signer
  const initializeContracts = async (providerOrSigner) => {
    try {
      const trading = new ethers.Contract(
        TRADING_CONTRACT_ADDRESS,
        TradingABI.abi,
        providerOrSigner
      );

      const pokemonCard = new ethers.Contract(
        POKEMON_CARD_CONTRACT_ADDRESS,
        PokemonCardABI.abi,
        providerOrSigner
      );

      setTradingContract(trading);
      setPokemonCardContract(pokemonCard);

      return { trading, pokemonCard };
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      return { trading: null, pokemonCard: null };
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);

        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setAccount(account);

        // Get provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const signer = provider.getSigner();
        setSigner(signer);

        // Get network information
        const network = await provider.getNetwork();
        setChainId(network.chainId);

        // Initialize contracts with signer
        await initializeContracts(signer);

        setIsConnecting(false);
        return true;
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setIsConnecting(false);
        return false;
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet");
      setIsConnecting(false);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    // Re-initialize contracts with provider only
    if (provider) {
      initializeContracts(provider);
    }
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Create provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Initialize contracts with provider (read-only)
          await initializeContracts(provider);

          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);

            // Get signer
            const signer = provider.getSigner();
            setSigner(signer);

            // Get network information
            const network = await provider.getNetwork();
            setChainId(network.chainId);

            // Reinitialize contracts with signer
            await initializeContracts(signer);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User has disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // User has switched accounts
          setAccount(accounts[0]);

          if (provider) {
            const signer = provider.getSigner();
            setSigner(signer);

            // Reinitialize contracts with new signer
            await initializeContracts(signer);
          }
        }
      };

      // Handle chain/network changes
      const handleChainChanged = (chainId) => {
        // Parse chainId from hex to decimal
        const parsedChainId = parseInt(chainId, 16);
        setChainId(parsedChainId);

        // Refresh the page on chain change as recommended by MetaMask
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider, account]);

  // Mint Pokemon functionality
  const mintPokemon = async (
    name,
    generation,
    pokemonType,
    power,
    rarity,
    isShiny,
    ipfsMetadataURI
  ) => {
    if (!signer || !pokemonCardContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Call the mintPokemon function
      const tx = await pokemonCardContract.mintPokemon(
        account, // mint to the connected account
        name,
        generation,
        pokemonType,
        power,
        rarity,
        isShiny,
        ipfsMetadataURI
      );

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error minting Pokemon:", error);
      return { success: false, error: error.message };
    }
  };

  // Create trading functionality
  const createFixedPriceListing = async (
    nftContractAddress,
    tokenId,
    price,
    duration
  ) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price.toString());

      // Create listing
      const tx = await tradingContract.createFixedPriceListing(
        nftContractAddress,
        tokenId,
        priceInWei,
        duration
      );

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error creating fixed price listing:", error);
      return { success: false, error: error.message };
    }
  };

  const createEnglishAuction = async (
    nftContractAddress,
    tokenId,
    startingPrice,
    duration
  ) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(startingPrice.toString());

      // Create auction
      const tx = await tradingContract.createEnglishAuction(
        nftContractAddress,
        tokenId,
        priceInWei,
        duration
      );

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error creating English auction:", error);
      return { success: false, error: error.message };
    }
  };

  const createDutchAuction = async (
    nftContractAddress,
    tokenId,
    startingPrice,
    endPrice,
    duration
  ) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Convert prices to wei
      const startingPriceInWei = ethers.utils.parseEther(
        startingPrice.toString()
      );
      const endPriceInWei = ethers.utils.parseEther(endPrice.toString());

      // Create auction
      const tx = await tradingContract.createDutchAuction(
        nftContractAddress,
        tokenId,
        startingPriceInWei,
        endPriceInWei,
        duration
      );

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error creating Dutch auction:", error);
      return { success: false, error: error.message };
    }
  };

  const buyNow = async (listingId, price) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price.toString());

      // Buy the listing
      const tx = await tradingContract.buyNow(listingId, { value: priceInWei });

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error buying listing:", error);
      return { success: false, error: error.message };
    }
  };

  const placeBid = async (listingId, bidAmount) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Convert bid amount to wei
      const bidAmountInWei = ethers.utils.parseEther(bidAmount.toString());

      // Place bid
      const tx = await tradingContract.placeBid(listingId, {
        value: bidAmountInWei,
      });

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error placing bid:", error);
      return { success: false, error: error.message };
    }
  };

  const finalizeAuction = async (listingId) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Finalize auction
      const tx = await tradingContract.finalizeAuction(listingId);

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error finalizing auction:", error);
      return { success: false, error: error.message };
    }
  };

  const cancelListing = async (listingId) => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Cancel listing
      const tx = await tradingContract.cancelListing(listingId);

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error cancelling listing:", error);
      return { success: false, error: error.message };
    }
  };

  const withdraw = async () => {
    if (!signer || !tradingContract)
      return { success: false, error: "Wallet not connected" };

    try {
      // Withdraw funds
      const tx = await tradingContract.withdraw();

      await tx.wait();

      return { success: true, transaction: tx };
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      return { success: false, error: error.message };
    }
  };

  // Context value
  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    tradingContract,
    pokemonCardContract,
    connectWallet,
    disconnectWallet,
    mintPokemon, // Added the mintPokemon function
    createFixedPriceListing,
    createEnglishAuction,
    createDutchAuction,
    buyNow,
    placeBid,
    finalizeAuction,
    cancelListing,
    withdraw,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
