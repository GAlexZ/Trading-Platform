import React from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowUpDown, Clock } from "lucide-react";
import { useListings } from "../context/ListingsContext";
import NftCard from "../components/NftCard";
import { useNavigate } from "react-router-dom";
import { resolveIPFS } from "../utils/ipfsHelper";

const HomePage = () => {
  const { listings, isLoading } = useListings();
  const navigate = useNavigate();

  // Get featured listings (first 3 listings)
  const featuredListings = listings.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero section - Improved image placement */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            {/* Create an angled background for better visual separation */}
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <div className="pt-10 pb-8 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-24 xl:pt-28 xl:pb-28">
              <div className="mt-6 mx-auto max-w-7xl px-4 sm:mt-8 sm:px-6 lg:px-8">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Trade Pokemon Cards</span>
                    <span className="block text-indigo-600">
                      On The Blockchain
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Buy, sell, and auction rare Pokemon cards using our
                    decentralized trading platform. Fixed price, English
                    auctions, and Dutch auctions available.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/marketplace"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                      >
                        Start Trading
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <a
                        href="#features"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Improved image container with better responsive behavior */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover object-center sm:h-72 md:h-96 lg:w-full lg:h-full"
            src={resolveIPFS(
              "ipfs://bafybeicgdimkd6gpbmsoytqgnhvbg66hekthlnhwsrhglhawtv3xcb6gi4"
            )}
            alt="Pokemon cards collection"
          />
        </div>
      </div>

      {/* Feature section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to trade Pokemon cards
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides secure, transparent, and flexible trading
              options for collectors and enthusiasts.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Tag className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Fixed Price Listings
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Set your price and sell your Pokemon cards instantly to
                  interested buyers.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ArrowUpDown className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    English Auctions
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Start with a minimum price and let bidders compete to win your
                  rare Pokemon cards.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Dutch Auctions
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Start high and watch the price decrease until a buyer decides
                  to purchase.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* How it works section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Trade with confidence
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our blockchain-based trading platform ensures secure and
              transparent transactions.
            </p>
          </div>

          <div className="relative">
            {/* Steps */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* Left column */}
              <div className="mt-10 lg:mt-0">
                <div className="space-y-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">1</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Connect Your Wallet
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        Connect your Ethereum wallet to our platform. We support
                        MetaMask, WalletConnect, and other popular providers.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">2</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Browse Listings
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        Explore our extensive collection of Pokemon cards. Use
                        filters to find exactly what you're looking for.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">3</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Buy, Bid, or Sell
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        Purchase cards at fixed prices, place bids in auctions,
                        or list your own cards for sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="mt-10 lg:mt-0">
                <div className="space-y-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">4</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Secure Transactions
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        All trades are secured by our smart contracts on the
                        Ethereum blockchain, ensuring safety and transparency.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">5</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Receive Your NFTs
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        Pokemon cards are delivered directly to your wallet as
                        NFTs, with verified authenticity and ownership.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
                        <span className="text-lg font-bold">6</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Build Your Collection
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        Grow your digital Pokemon card collection with rare and
                        valuable cards from around the world.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-12 text-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Explore the Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Cards section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Featured Cards
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Rare finds and hot deals
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Check out some of the most sought-after Pokemon cards currently
              available on our platform.
            </p>
          </div>

          {/* Featured Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading placeholders
              [...Array(3)].map((_, i) => (
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
              ))
            ) : featuredListings.length > 0 ? (
              // Display featured listings
              featuredListings.map((listing) => (
                <NftCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/marketplace/${listing.id}`)}
                />
              ))
            ) : (
              // Fallback if no listings
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">
                  No listings available at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="mt-10 text-center">
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Cards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
