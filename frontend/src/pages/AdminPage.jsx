import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Shield,
  Settings,
  DollarSign,
  Pause,
  Play,
  Users,
  Edit,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import ContractAddresses from "../components/ContractAddresses";
import { resolveIPFS, createPlaceholder } from "../utils/ipfsHelper";
import { ethers } from "ethers";
import LoadingSpinner from "../components/LoadingSpinner";

// Tab options
const TABS = {
  MINT: "mint",
  CONTRACT: "contract",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const {
    account,
    mintPokemon,
    burnPokemon,
    pokemonCardContract,
    tradingContract,
    chainId,
    provider,
    signer,
  } = useWeb3();

  // State to track if current user is the contract owner
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.MINT);

  // State for contract management
  const [isPaused, setIsPaused] = useState(false);
  const [platformFee, setPlatformFee] = useState("1.00");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [newFeeRecipient, setNewFeeRecipient] = useState("");
  const [withdrawableBalance, setWithdrawableBalance] = useState("0.0");
  const [loadingContractInfo, setLoadingContractInfo] = useState(true);

  // Form state for minting (from existing AdminPage)
  const [formData, setFormData] = useState({
    name: "",
    generation: 1,
    pokemonType: "Electric",
    power: 100,
    rarity: 3,
    isShiny: false,
    ipfsMetadataURI:
      "ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa",
  });

  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mintedCards, setMintedCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [showBurnConfirmation, setShowBurnConfirmation] = useState(false);
  const [cardToBurn, setCardToBurn] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isTestingIPFS, setIsTestingIPFS] = useState(false);

  // Pokemon types for selection
  const pokemonTypes = [
    "Fire",
    "Water",
    "Electric",
    "Grass",
    "Psychic",
    "Fighting",
    "Normal",
    "Dragon",
    "Dark",
    "Fairy",
  ];

  // Check if current user is the contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      setIsCheckingOwner(true);
      if (account && pokemonCardContract) {
        try {
          const owner = await pokemonCardContract.owner();
          setIsOwner(owner.toLowerCase() === account.toLowerCase());
        } catch (error) {
          console.error("Error checking contract ownership:", error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
      setIsCheckingOwner(false);
    };

    checkOwnership();
  }, [account, pokemonCardContract]);

  // Redirect if not the owner
  useEffect(() => {
    if (!isCheckingOwner && !isOwner) {
      navigate("/marketplace");
    }
  }, [isOwner, isCheckingOwner, navigate]);

  // Fetch contract information
  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!tradingContract || !account) return;

      setLoadingContractInfo(true);
      try {
        // Get contract status
        const paused = await tradingContract.paused();
        setIsPaused(paused);

        // Get platform fee
        const fee = await tradingContract.platformFeePercentage();
        setPlatformFee((Number(fee) / 100).toFixed(2)); // Convert from basis points to percentage

        // Get fee recipient
        const recipient = await tradingContract.feeRecipient();
        setFeeRecipient(recipient);
        setNewFeeRecipient(recipient);

        // Get withdrawable balance
        if (provider) {
          const balance = await tradingContract.pendingWithdrawals(account);
          setWithdrawableBalance(ethers.utils.formatEther(balance));
        }
      } catch (error) {
        console.error("Error fetching contract info:", error);
        setErrorMessage("Failed to fetch contract information");
      } finally {
        setLoadingContractInfo(false);
      }
    };

    fetchContractInfo();
  }, [tradingContract, account, provider]);

  // Handle IPFS URI change and update preview
  const handleIPFSChange = (e) => {
    const uri = e.target.value;
    setFormData({
      ...formData,
      ipfsMetadataURI: uri,
    });

    // Update preview image
    if (uri) {
      setImagePreview(resolveIPFS(uri));
    } else {
      setImagePreview("");
    }
  };

  // Test IPFS resolution
  const testIPFSResolution = () => {
    setIsTestingIPFS(true);

    try {
      const resolvedUrl = resolveIPFS(formData.ipfsMetadataURI);
      setImagePreview(resolvedUrl);
      setSuccessMessage(`IPFS URI resolved to: ${resolvedUrl}`);
    } catch (error) {
      setErrorMessage(`Failed to resolve IPFS URI: ${error.message}`);
    } finally {
      setIsTestingIPFS(false);
    }
  };

  // Fetch user's minted Pokemon cards
  const fetchMintedCards = async () => {
    if (!pokemonCardContract || !account) return;

    setIsLoadingCards(true);
    try {
      // Use the getAllPokemonByOwner function from the contract
      const [tokenIds, pokemons] =
        await pokemonCardContract.getAllPokemonByOwner(account);

      // Format the data
      const formattedCards = await Promise.all(
        tokenIds.map(async (id, index) => {
          const pokemon = pokemons[index];
          const tokenId = id.toString();

          // Get token URI
          let tokenURI = "";
          try {
            tokenURI = await pokemonCardContract.tokenURI(tokenId);
          } catch (err) {
            console.error(`Error fetching tokenURI for token ${tokenId}:`, err);
          }

          // Resolve the IPFS URI to an HTTP URL
          const imageUrl = tokenURI
            ? resolveIPFS(tokenURI)
            : createPlaceholder(pokemon.name);

          return {
            id: tokenId,
            name: pokemon.name,
            generation: pokemon.generation,
            type: pokemon.pokemonType,
            power: pokemon.power,
            rarity: pokemon.rarity,
            isShiny: pokemon.isShiny,
            tokenURI: tokenURI,
            image: imageUrl,
            timestamp: new Date().toISOString(), // We don't have timestamp in contract, so use current time
          };
        })
      );

      setMintedCards(formattedCards);
    } catch (err) {
      console.error("Error fetching minted Pokemon cards:", err);
      setErrorMessage("Failed to fetch your Pokemon cards.");
    } finally {
      setIsLoadingCards(false);
    }
  };

  // Fetch cards when component mounts or account changes
  useEffect(() => {
    if (account && pokemonCardContract && isOwner) {
      fetchMintedCards();
    }
  }, [account, pokemonCardContract, isOwner]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value,
    });
  };

  // Handle back button
  const handleBack = () => {
    navigate("/marketplace");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Validate form data
      if (!formData.name) {
        throw new Error("Pokemon name is required");
      }

      // Call the mintPokemon function from our context
      const result = await mintPokemon(
        formData.name,
        formData.generation,
        formData.pokemonType,
        formData.power,
        formData.rarity,
        formData.isShiny,
        formData.ipfsMetadataURI
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to mint Pokemon card");
      }

      // Extract token ID from the transaction receipt if possible
      const tokenId = result.transaction?.hash
        ? `${result.transaction.hash.substring(0, 6)}`
        : Date.now().toString();

      // Add to minted cards list
      const newCard = {
        ...formData,
        id: tokenId,
        type: formData.pokemonType,
        timestamp: new Date().toISOString(),
      };

      setMintedCards([newCard, ...mintedCards]);
      setSuccessMessage(
        `Successfully minted ${formData.name} (Token ID: ${tokenId})`
      );

      // Fetch updated list of cards
      fetchMintedCards();

      // Reset form for next mint
      setFormData({
        ...formData,
        name: "",
      });
    } catch (error) {
      console.error("Error minting Pokemon:", error);
      setErrorMessage(error.message || "Failed to mint Pokemon card");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle burn button click
  const handleBurnClick = (card) => {
    setCardToBurn(card);
    setShowBurnConfirmation(true);
  };

  // Confirm and burn NFT
  const confirmBurn = async () => {
    if (!cardToBurn) return;

    setIsProcessing(true);
    setShowBurnConfirmation(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await burnPokemon(cardToBurn.id);

      if (result.success) {
        setSuccessMessage(
          `Successfully burned ${cardToBurn.name} (Token ID: ${cardToBurn.id})`
        );

        // Remove card from list
        setMintedCards(mintedCards.filter((card) => card.id !== cardToBurn.id));
      } else {
        setErrorMessage(result.error || "Failed to burn Pokemon card");
      }
    } catch (error) {
      console.error("Error burning Pokemon:", error);
      setErrorMessage(error.message || "Failed to burn Pokemon card");
    } finally {
      setIsProcessing(false);
      setCardToBurn(null);
    }
  };

  // NEW ADMIN FUNCTIONS

  // Toggle pause state
  const togglePause = async () => {
    if (!tradingContract) return;

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let tx;
      if (isPaused) {
        tx = await tradingContract.unpause();
      } else {
        tx = await tradingContract.pause();
      }

      await tx.wait();

      setIsPaused(!isPaused);
      setSuccessMessage(
        `Contract has been ${isPaused ? "unpaused" : "paused"} successfully!`
      );
    } catch (error) {
      console.error(
        `Error ${isPaused ? "unpausing" : "pausing"} contract:`,
        error
      );
      setErrorMessage(
        error.message || `Failed to ${isPaused ? "unpause" : "pause"} contract`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Update platform fee
  const updatePlatformFee = async () => {
    if (!tradingContract) return;

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Convert percentage to basis points (1% = 100 basis points)
      const feeInBasisPoints = Math.round(parseFloat(platformFee) * 100);

      if (
        isNaN(feeInBasisPoints) ||
        feeInBasisPoints < 0 ||
        feeInBasisPoints > 1000
      ) {
        throw new Error("Fee must be between 0% and 10%");
      }

      const tx = await tradingContract.setPlatformFeePercentage(
        feeInBasisPoints
      );
      await tx.wait();

      setSuccessMessage(
        `Platform fee updated to ${platformFee}% successfully!`
      );
    } catch (error) {
      console.error("Error updating platform fee:", error);
      setErrorMessage(error.message || "Failed to update platform fee");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update fee recipient
  const updateFeeRecipient = async () => {
    if (!tradingContract || !newFeeRecipient) return;

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validate address
      if (!ethers.utils.isAddress(newFeeRecipient)) {
        throw new Error("Invalid Ethereum address");
      }

      const tx = await tradingContract.setFeeRecipient(newFeeRecipient);
      await tx.wait();

      setFeeRecipient(newFeeRecipient);
      setSuccessMessage(
        `Fee recipient updated to ${newFeeRecipient} successfully!`
      );
    } catch (error) {
      console.error("Error updating fee recipient:", error);
      setErrorMessage(error.message || "Failed to update fee recipient");
    } finally {
      setIsProcessing(false);
    }
  };

  // Withdraw funds
  const withdrawFunds = async () => {
    if (!tradingContract) return;

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const tx = await tradingContract.withdraw();
      await tx.wait();

      setWithdrawableBalance("0.0");
      setSuccessMessage(
        `Successfully withdrew ${withdrawableBalance} ETH to your wallet!`
      );
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setErrorMessage(error.message || "Failed to withdraw funds");
    } finally {
      setIsProcessing(false);
    }
  };

  // If still checking owner status, show loading
  if (isCheckingOwner) {
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Checking access...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // If not the owner, this should never render due to the redirect,
  // but keeping as a fallback
  if (!isOwner) {
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

          <div className="p-6">
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Admin Access Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This page is only accessible to the contract owner. Please
                      connect with the owner account to access this page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard{" "}
              <span className="text-indigo-600">• Contract Owner</span>
            </h1>

            <div className="flex items-center">
              <Shield className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm text-gray-600">
                {`${account.substring(0, 6)}...${account.substring(
                  account.length - 4
                )}`}
              </span>
            </div>
          </div>

          {/* Contract Addresses Display */}
          <ContractAddresses
            tradingAddress={tradingContract?.address}
            pokemonCardAddress={pokemonCardContract?.address}
            network={
              chainId
                ? chainId === 1
                  ? "Mainnet"
                  : chainId === 5
                  ? "Goerli"
                  : chainId === 11155111
                  ? "Sepolia"
                  : chainId === 31337
                  ? "Hardhat"
                  : chainId === 1337
                  ? "Local"
                  : `Chain ID: ${chainId}`
                : "Not connected"
            }
          />

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

          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab(TABS.MINT)}
                className={`${
                  activeTab === TABS.MINT
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Mint & Burn Pokemon
              </button>
              <button
                onClick={() => setActiveTab(TABS.CONTRACT)}
                className={`${
                  activeTab === TABS.CONTRACT
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Settings className="h-5 w-5 mr-2" />
                Contract Management
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === TABS.MINT && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mint Form */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Mint New Pokemon Card
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Pokemon Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pokemon Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Pikachu"
                      required
                    />
                  </div>

                  {/* Generation */}
                  <div>
                    <label
                      htmlFor="generation"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Generation
                    </label>
                    <select
                      id="generation"
                      name="generation"
                      value={formData.generation}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                        <option key={gen} value={gen}>
                          Gen {gen}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pokemon Type */}
                  <div>
                    <label
                      htmlFor="pokemonType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Type
                    </label>
                    <select
                      id="pokemonType"
                      name="pokemonType"
                      value={formData.pokemonType}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {pokemonTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Power */}
                  <div>
                    <label
                      htmlFor="power"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Power
                    </label>
                    <input
                      type="number"
                      id="power"
                      name="power"
                      min="1"
                      max="999"
                      value={formData.power}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Rarity */}
                  <div>
                    <label
                      htmlFor="rarity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rarity (1-5 stars)
                    </label>
                    <input
                      type="range"
                      id="rarity"
                      name="rarity"
                      min="1"
                      max="5"
                      value={formData.rarity}
                      onChange={handleChange}
                      className="mt-1 block w-full"
                    />
                    <div className="text-center font-medium">
                      {"⭐".repeat(formData.rarity)}
                    </div>
                  </div>

                  {/* Is Shiny */}
                  <div className="flex items-center">
                    <input
                      id="isShiny"
                      name="isShiny"
                      type="checkbox"
                      checked={formData.isShiny}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isShiny"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Shiny Pokemon
                    </label>
                  </div>

                  {/* IPFS Metadata URI with Preview */}
                  <div>
                    <label
                      htmlFor="ipfsMetadataURI"
                      className="block text-sm font-medium text-gray-700"
                    >
                      IPFS Metadata URI
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="text"
                        id="ipfsMetadataURI"
                        name="ipfsMetadataURI"
                        value={formData.ipfsMetadataURI}
                        onChange={handleIPFSChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa"
                      />
                      <button
                        type="button"
                        onClick={testIPFSResolution}
                        disabled={isTestingIPFS}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Test
                      </button>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-3 border rounded-md p-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Image Preview:
                        </p>
                        <div className="flex items-center justify-center border border-gray-200 rounded-md p-2 bg-gray-50 h-40">
                          <img
                            src={imagePreview}
                            alt="IPFS Preview"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = createPlaceholder(formData.name);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Mint Pokemon Card"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Recently Minted Cards with Burn Option */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Your Pokemon Cards
                  </h2>
                  <button
                    onClick={fetchMintedCards}
                    disabled={isLoadingCards}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {isLoadingCards ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {isLoadingCards ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : mintedCards.length === 0 ? (
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-gray-500">No cards found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {mintedCards.map((card) => (
                      <div
                        key={card.id}
                        className="border rounded-md p-4 hover:shadow-sm"
                      >
                        <div className="flex md:flex-row flex-col gap-3">
                          {/* Card Image */}
                          <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={card.image}
                              alt={card.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = createPlaceholder(card.name);
                              }}
                            />
                          </div>

                          {/* Card Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start flex-wrap">
                              <div className="mr-2">
                                <h3 className="font-medium text-gray-900">
                                  {card.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Token ID: {card.id}
                                </p>
                                {card.tokenURI && (
                                  <p className="text-xs text-gray-400 truncate max-w-full">
                                    URI: {card.tokenURI}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center flex-shrink-0 mt-1 md:mt-0">
                                {card.isShiny && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mr-2 whitespace-nowrap">
                                    ✨ Shiny
                                  </span>
                                )}
                                <button
                                  onClick={() => handleBurnClick(card)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded flex-shrink-0"
                                  title="Burn NFT"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Type:</span>{" "}
                                <span className="text-gray-900">
                                  {card.type}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Gen:</span>{" "}
                                <span className="text-gray-900">
                                  {card.generation}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Power:</span>{" "}
                                <span className="text-gray-900">
                                  {card.power}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Rarity:</span>{" "}
                                <span className="text-gray-900">
                                  {"⭐".repeat(card.rarity)}
                                </span>
                              </div>
                            </div>
                            {card.timestamp && (
                              <div className="mt-2 text-xs text-gray-400">
                                Minted:{" "}
                                {new Date(card.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === TABS.CONTRACT && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Contract Management
              </h2>

              {loadingContractInfo ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="large" color="indigo" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pause/Unpause Contract */}
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Contract Status
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          When paused, the contract will not allow new listings
                          or purchases. This is useful for emergency situations
                          or maintenance.
                        </p>
                      </div>
                      <div className="mt-5">
                        <button
                          onClick={togglePause}
                          disabled={isProcessing}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isPaused
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {isProcessing ? (
                            <LoadingSpinner size="small" color="white" />
                          ) : isPaused ? (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Unpause Contract
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Contract
                            </>
                          )}
                        </button>
                        <span className="ml-3 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-800 bg-gray-100">
                          Current Status:{" "}
                          <span
                            className={`ml-1 font-semibold ${
                              isPaused ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isPaused ? "PAUSED" : "ACTIVE"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Fee */}
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Platform Fee
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          Set the platform fee percentage for all trades (1.00 =
                          1%). This fee is collected on each sale and sent to
                          the fee recipient.
                        </p>
                      </div>
                      <div className="mt-5 sm:flex sm:items-end">
                        <div className="w-full sm:max-w-xs">
                          <label htmlFor="platformFee" className="sr-only">
                            Platform Fee
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              name="platformFee"
                              id="platformFee"
                              className="block w-full pr-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              placeholder="1.00"
                              step="0.01"
                              min="0"
                              max="10"
                              value={platformFee}
                              onChange={(e) => setPlatformFee(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={updatePlatformFee}
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? (
                            <LoadingSpinner size="small" color="white" />
                          ) : (
                            "Update Fee"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fee Recipient */}
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Fee Recipient
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          Set the address that will receive all platform fees
                          generated from trades.
                        </p>
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Current recipient:
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {feeRecipient}
                        </span>
                      </div>
                      <div className="mt-5 sm:flex sm:items-end">
                        <div className="w-full">
                          <label htmlFor="newFeeRecipient" className="sr-only">
                            New Fee Recipient
                          </label>
                          <input
                            type="text"
                            name="newFeeRecipient"
                            id="newFeeRecipient"
                            className="block w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            placeholder="0x..."
                            value={newFeeRecipient}
                            onChange={(e) => setNewFeeRecipient(e.target.value)}
                          />
                        </div>
                        <button
                          onClick={updateFeeRecipient}
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? (
                            <LoadingSpinner size="small" color="white" />
                          ) : (
                            "Update Recipient"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Burn Confirmation Modal */}
      {showBurnConfirmation && cardToBurn && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Burn Pokemon NFT
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to burn {cardToBurn.name} (ID:{" "}
                      {cardToBurn.id})? This action cannot be undone and the NFT
                      will be permanently removed from the blockchain.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmBurn}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Burn NFT"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowBurnConfirmation(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
