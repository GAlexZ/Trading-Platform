import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Wallet, AlertTriangle } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import LoadingSpinner from "../components/LoadingSpinner";

const MyCollectionPage = () => {
  const navigate = useNavigate();
  const { account, connectWallet, fetchMyPokemonCards } = useWeb3();

  // State
  const [pokemonCards, setPokemonCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    generation: "all",
    type: "all",
    rarity: "all",
    shiny: false,
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pokemon types for filter
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

  // Fetch Pokemon cards
  const fetchPokemonCards = async () => {
    if (!account) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchMyPokemonCards();

      if (result.success) {
        setPokemonCards(result.cards);
      } else {
        setError(
          result.error ||
            "Failed to fetch your Pokemon cards. Please try again later."
        );
      }
    } catch (err) {
      console.error("Error fetching Pokemon cards:", err);
      setError("Failed to fetch your Pokemon cards. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cards when component mounts or account changes
  useEffect(() => {
    if (account) {
      fetchPokemonCards();
    } else {
      setPokemonCards([]);
      setIsLoading(false);
    }
  }, [account, fetchMyPokemonCards]);

  // Apply filters
  const filteredCards = pokemonCards.filter((card) => {
    // Search filter
    if (
      filters.search &&
      !card.name.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Generation filter
    if (
      filters.generation !== "all" &&
      card.generation !== parseInt(filters.generation)
    ) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && card.type !== filters.type) {
      return false;
    }

    // Rarity filter
    if (filters.rarity !== "all" && card.rarity !== parseInt(filters.rarity)) {
      return false;
    }

    // Shiny filter
    if (filters.shiny && !card.isShiny) {
      return false;
    }

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      generation: "all",
      type: "all",
      rarity: "all",
      shiny: false,
      search: "",
    });
  };

  // Handle going back
  const handleBack = () => {
    navigate("/marketplace");
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
              Please connect your wallet to view your Pokemon collection.
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-2 md:mb-0"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to marketplace</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              My Pokemon Collection
            </h1>
            <p className="text-gray-600">
              Manage and view your owned Pokemon cards
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <button
              onClick={fetchPokemonCards}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters panel */}
          {showFilters && (
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Pokemon name"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </div>

                  {/* Generation Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generation
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={filters.generation}
                      onChange={(e) =>
                        setFilters({ ...filters, generation: e.target.value })
                      }
                    >
                      <option value="all">All Generations</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                        <option key={gen} value={gen}>
                          Gen {gen}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={filters.type}
                      onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value })
                      }
                    >
                      <option value="all">All Types</option>
                      {pokemonTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rarity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rarity
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={filters.rarity}
                      onChange={(e) =>
                        setFilters({ ...filters, rarity: e.target.value })
                      }
                    >
                      <option value="all">All Rarities</option>
                      {[1, 2, 3, 4, 5].map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity} ⭐
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shiny Filter */}
                  <div className="flex items-center">
                    <input
                      id="shiny-filter"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.shiny}
                      onChange={(e) =>
                        setFilters({ ...filters, shiny: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="shiny-filter"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Shiny Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredCards.length} of {pokemonCards.length} Pokemon
                cards
              </p>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="large" />
              </div>
            ) : pokemonCards.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No Pokemon cards found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any Pokemon cards in your collection yet.
                </p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  No matching Pokemon cards
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No Pokemon cards match your current filters.
                </p>
                <div className="mt-4">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-48 object-cover object-center"
                      />
                      {card.isShiny && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-800 text-xs font-medium rounded-md">
                          ✨ Shiny
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.name}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {card.id}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Gen {card.generation}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {card.type}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Power: {card.power}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {"⭐".repeat(card.rarity)}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() =>
                            navigate(`/create-listing?tokenId=${card.id}`)
                          }
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          List for Sale
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCollectionPage;
