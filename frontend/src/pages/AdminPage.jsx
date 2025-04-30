import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import ContractAddresses from "../components/ContractAddresses";

const AdminPage = () => {
  const navigate = useNavigate();
  const {
    account,
    mintPokemon,
    pokemonCardContract,
    tradingContract,
    chainId,
  } = useWeb3();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    generation: 1,
    pokemonType: "Electric",
    power: 100,
    rarity: 3,
    isShiny: false,
    ipfsMetadataURI: "ipfs://QmPlaceholder", // This would be a real IPFS URI in production
  });

  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mintedCards, setMintedCards] = useState([]);

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

      // For demo purposes, we'll use a simple ID (in a real app, we'd extract from transaction)
      const tokenId = Date.now().toString();

      // Add to minted cards list
      const newCard = {
        ...formData,
        id: tokenId,
        timestamp: new Date().toISOString(),
      };

      setMintedCards([newCard, ...mintedCards]);
      setSuccessMessage(
        `Successfully minted ${formData.name} (Token ID: ${tokenId})`
      );

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

  // Render admin notice if not connected
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
                      Please connect your wallet with the admin account to
                      access this page. Only the contract owner can mint new
                      Pokemon cards.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Admin Dashboard - Mint Pokemon Cards
          </h1>

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

                {/* IPFS Metadata URI */}
                <div>
                  <label
                    htmlFor="ipfsMetadataURI"
                    className="block text-sm font-medium text-gray-700"
                  >
                    IPFS Metadata URI
                  </label>
                  <input
                    type="text"
                    id="ipfsMetadataURI"
                    name="ipfsMetadataURI"
                    value={formData.ipfsMetadataURI}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    In a real app, you would upload image to IPFS and use the
                    resulting hash. For testing, you can use this placeholder.
                  </p>
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

            {/* Recently Minted Cards */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recently Minted Cards
              </h2>

              {mintedCards.length === 0 ? (
                <div className="bg-gray-50 rounded-md p-4 text-center">
                  <p className="text-gray-500">No cards minted yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {mintedCards.map((card) => (
                    <div
                      key={card.id}
                      className="border rounded-md p-4 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {card.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Token ID: {card.id}
                          </p>
                        </div>
                        {card.isShiny && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            ✨ Shiny
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>{" "}
                          <span className="text-gray-900">
                            {card.pokemonType}
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
                          <span className="text-gray-900">{card.power}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rarity:</span>{" "}
                          <span className="text-gray-900">
                            {"⭐".repeat(card.rarity)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Minted: {new Date(card.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
