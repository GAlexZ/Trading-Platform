import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import { useListings } from "../context/ListingsContext";
import { useWeb3 } from "../context/Web3Context";
import NftCard from "../components/NftCard";

const MarketplacePage = () => {
  const { listings, isLoading, error } = useListings();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  // Filter state
  const [filters, setFilters] = useState({
    saleType: "all",
    generation: "all",
    type: "all",
    rarity: "all",
    shiny: false,
    search: searchQuery,
  });

  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update search filter when URL search param changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

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

  // Apply filters to listings
  const filteredListings = listings.filter((listing) => {
    // Search filter
    if (
      filters.search &&
      !listing.name.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Sale type filter
    if (filters.saleType !== "all" && listing.saleType !== filters.saleType) {
      return false;
    }

    // Generation filter
    if (
      filters.generation !== "all" &&
      listing.generation !== parseInt(filters.generation)
    ) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && listing.type !== filters.type) {
      return false;
    }

    // Rarity filter
    if (
      filters.rarity !== "all" &&
      listing.rarity !== parseInt(filters.rarity)
    ) {
      return false;
    }

    // Shiny filter
    if (filters.shiny && !listing.isShiny) {
      return false;
    }

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      saleType: "all",
      generation: "all",
      type: "all",
      rarity: "all",
      shiny: false,
      search: filters.search, // Keep search as is
    });
  };

  // Handle NFT card click
  const handleCardClick = (listing) => {
    navigate(`/marketplace/${listing.id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pokemon Card Marketplace
            </h1>
            <p className="text-gray-600">Browse and trade rare Pokemon cards</p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            {account && (
              <Link
                to="/create-listing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Listing
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Filters
              </h2>

              <div className="space-y-6">
                {/* Sale Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Type
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.saleType}
                    onChange={(e) =>
                      setFilters({ ...filters, saleType: e.target.value })
                    }
                  >
                    <option value="all">All Types</option>
                    <option value="FixedPrice">Fixed Price</option>
                    <option value="EnglishAuction">English Auction</option>
                    <option value="DutchAuction">Dutch Auction</option>
                  </select>
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

                {/* Reset Filters */}
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75">
              <div className="fixed inset-y-0 right-0 z-50 max-w-xs w-full bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Mobile Filters - Same as desktop */}
                  {/* Sale Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Type
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={filters.saleType}
                      onChange={(e) =>
                        setFilters({ ...filters, saleType: e.target.value })
                      }
                    >
                      <option value="all">All Types</option>
                      <option value="FixedPrice">Fixed Price</option>
                      <option value="EnglishAuction">English Auction</option>
                      <option value="DutchAuction">Dutch Auction</option>
                    </select>
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
                      id="mobile-shiny-filter"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.shiny}
                      onChange={(e) =>
                        setFilters({ ...filters, shiny: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="mobile-shiny-filter"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Shiny Only
                    </label>
                  </div>

                  <div className="space-y-2">
                    {/* Apply Filters */}
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Apply Filters
                    </button>

                    {/* Reset Filters */}
                    <button
                      onClick={() => {
                        resetFilters();
                        setShowMobileFilters(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {filteredListings.length}{" "}
                    {filteredListings.length === 1 ? "result" : "results"}
                  </p>
                </div>

                {/* Grid of cards */}
                {filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <NftCard
                        key={listing.id}
                        listing={listing}
                        onClick={() => handleCardClick(listing)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No listings found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No Pokemon cards match your current filters.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
