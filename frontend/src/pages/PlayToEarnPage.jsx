import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  GameController,
  Coins,
  Users,
  Award,
  Calendar,
  GiftIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlayToEarnPage = () => {
  const navigate = useNavigate();

  // Handle going back
  const handleBack = () => {
    navigate("/marketplace");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
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
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-2 md:mb-0"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to marketplace</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Play to Earn with Pokemon Cards
            </h1>
            <p className="text-gray-600">
              Coming Soon: Battle, collect rewards, and climb the ranks
            </p>
          </div>
        </div>

        {/* Main Banner */}
        <div className="bg-indigo-700 rounded-xl overflow-hidden shadow-xl mb-10">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-800 text-white mb-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Coming Q3 2025</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
                Play, Battle, Earn Rewards
              </h2>
              <p className="text-indigo-100 text-lg mb-6">
                Use your Pokemon NFT cards to battle other players, earn tokens,
                and unlock exclusive rewards. Join our waitlist to get early
                access and special bonuses!
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="#waitlist"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  Join Waitlist
                </a>
                <a
                  href="#learn-more"
                  className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-800"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex items-center justify-center p-8 bg-indigo-800">
              <div className="relative w-full max-w-md">
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 opacity-20 animate-pulse rounded-lg"></div>
                <img
                  src="https://ipfs.io/ipfs/bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa"
                  alt="Pokemon Gaming"
                  className="relative z-10 w-full h-auto rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-full p-4 shadow-lg">
                  <GameController className="h-10 w-10 text-indigo-800" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="learn-more" className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How Play to Earn Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Battle with your NFT Pokemon cards, earn tokens, and climb the
              ranks
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                  <GameController className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Battle System
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Create your team with up to 6 Pokemon NFT cards and battle
                  against other players in turn-based or real-time strategic
                  gameplay.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Earn $POKETOKEN
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Win battles to earn our in-game cryptocurrency $POKETOKEN,
                  which can be used to purchase booster packs, rare cards, and
                  other in-game items.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Tournaments & Leagues
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Participate in weekly tournaments and seasonal leagues for a
                  chance to win exclusive NFTs and large $POKETOKEN prize pools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Economics */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-12">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              $POKETOKEN Economics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Token Distribution
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-indigo-500"></div>
                    </div>
                    <p className="ml-3 text-gray-500">
                      <span className="font-medium text-gray-700">40%</span> -
                      Play to Earn Rewards
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-green-500"></div>
                    </div>
                    <p className="ml-3 text-gray-500">
                      <span className="font-medium text-gray-700">20%</span> -
                      Development Fund
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-yellow-500"></div>
                    </div>
                    <p className="ml-3 text-gray-500">
                      <span className="font-medium text-gray-700">15%</span> -
                      Marketing
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-red-500"></div>
                    </div>
                    <p className="ml-3 text-gray-500">
                      <span className="font-medium text-gray-700">15%</span> -
                      Liquidity Pool
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="ml-3 text-gray-500">
                      <span className="font-medium text-gray-700">10%</span> -
                      Team
                    </p>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Token Utility
                </h3>
                <ul className="space-y-2 text-gray-500">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-6 w-6 text-green-500 inline-flex items-center justify-center">
                        •
                      </span>
                    </div>
                    <p className="ml-2">
                      Purchase rare Pokemon NFT cards and booster packs
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-6 w-6 text-green-500 inline-flex items-center justify-center">
                        •
                      </span>
                    </div>
                    <p className="ml-2">
                      Enter high-stakes tournaments with larger prize pools
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-6 w-6 text-green-500 inline-flex items-center justify-center">
                        •
                      </span>
                    </div>
                    <p className="ml-2">
                      Evolve Pokemon cards to increase their power and value
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-6 w-6 text-green-500 inline-flex items-center justify-center">
                        •
                      </span>
                    </div>
                    <p className="ml-2">
                      Stake tokens to earn passive rewards and exclusive perks
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-6 w-6 text-green-500 inline-flex items-center justify-center">
                        •
                      </span>
                    </div>
                    <p className="ml-2">
                      Governance voting for future game development
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Roadmap</h2>
          <div className="relative">
            {/* Line connecting the timeline */}
            <div className="absolute left-5 md:left-1/2 transform md:-translate-x-1/2 top-0 h-full w-0.5 bg-indigo-200"></div>

            {/* Q2 2025 */}
            <div className="relative mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-8 order-2 md:order-1">
                  <h3 className="text-lg font-medium text-gray-900">Q2 2025</h3>
                  <div className="mt-2 text-base text-gray-500">
                    <p>• Beta testing program launch</p>
                    <p>• $POKETOKEN smart contract development</p>
                    <p>• Basic battle mechanics implementation</p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white relative z-10 order-1 md:order-2 mb-4 md:mb-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div className="flex-1 md:pl-8 order-3"></div>
              </div>
            </div>

            {/* Q3 2025 */}
            <div className="relative mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-8 order-2 md:order-1 md:hidden"></div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white relative z-10 order-1 md:order-2 mb-4 md:mb-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div className="flex-1 md:pl-8 order-3 md:order-3">
                  <h3 className="text-lg font-medium text-gray-900">Q3 2025</h3>
                  <div className="mt-2 text-base text-gray-500">
                    <p>• Official game launch for NFT holders</p>
                    <p>• $POKETOKEN public sale</p>
                    <p>• First tournament with prize pool</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Q4 2025 */}
            <div className="relative mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-8 order-2 md:order-1">
                  <h3 className="text-lg font-medium text-gray-900">Q4 2025</h3>
                  <div className="mt-2 text-base text-gray-500">
                    <p>• Enhanced battle mechanics and special moves</p>
                    <p>• Seasonal league launch</p>
                    <p>• Pokemon evolution feature</p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white relative z-10 order-1 md:order-2 mb-4 md:mb-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div className="flex-1 md:pl-8 order-3"></div>
              </div>
            </div>

            {/* Q1 2026 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-8 order-2 md:order-1 md:hidden"></div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white relative z-10 order-1 md:order-2 mb-4 md:mb-0">
                  <span className="text-sm font-bold">4</span>
                </div>
                <div className="flex-1 md:pl-8 order-3 md:order-3">
                  <h3 className="text-lg font-medium text-gray-900">Q1 2026</h3>
                  <div className="mt-2 text-base text-gray-500">
                    <p>• Mobile app launch</p>
                    <p>• Team battles and clan system</p>
                    <p>• Governance staking for token holders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Form */}
        <div
          id="waitlist"
          className="bg-indigo-50 rounded-lg overflow-hidden shadow-md mb-12"
        >
          <div className="px-6 py-12 md:px-12">
            <div className="md:flex">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join the Waitlist
                </h2>
                <p className="text-gray-600 mb-6">
                  Be the first to know when our Play to Earn feature launches.
                  Early adopters will receive special bonuses and exclusive
                  NFTs.
                </p>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First name
                      </label>
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wallet"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Ethereum Wallet Address
                    </label>
                    <input
                      type="text"
                      name="wallet"
                      id="wallet"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Join Waitlist
                    </button>
                  </div>
                </form>
              </div>
              <div className="md:w-1/3 md:pl-10 flex flex-col justify-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Early Access Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <GiftIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        Exclusive starter Pokemon NFT
                      </span>
                    </li>
                    <li className="flex items-start">
                      <GiftIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        250 $POKETOKEN airdrop
                      </span>
                    </li>
                    <li className="flex items-start">
                      <GiftIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        Early access to tournaments
                      </span>
                    </li>
                    <li className="flex items-start">
                      <GiftIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        Unique profile badge for OG players
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Do I need to own Pokemon NFTs to participate?
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>
                    Yes, you'll need to own at least one Pokemon NFT card to
                    participate in the Play to Earn system. However, we'll offer
                    starter packs for new players who don't yet own any NFTs to
                    get started.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  How do battles work?
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>
                    Battles will be turn-based strategy games where your
                    Pokemon's stats, type, and special abilities determine the
                    outcome. Each Pokemon card has unique moves and attributes
                    based on its rarity and generation. Strategy and team
                    composition will be key to winning!
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  What can I do with $POKETOKEN?
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>
                    $POKETOKEN is our in-game utility token that can be used to
                    purchase new Pokemon NFTs, enter tournaments, evolve your
                    existing Pokemon, and participate in governance. It can also
                    be traded on select exchanges once launched.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Can I trade my Pokemon NFTs after using them in the game?
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>
                    Absolutely! Your Pokemon NFTs can be freely traded on our
                    marketplace at any time. In fact, Pokemon that have won
                    battles or tournaments might even become more valuable due
                    to their battle history being recorded on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Community Section */}
        <div className="bg-indigo-700 rounded-lg overflow-hidden">
          <div className="px-6 py-12 md:py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-6">
              Join Our Community
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-indigo-100 mb-8">
              Stay updated with the latest news, connect with other trainers,
              and get exclusive sneak peeks!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#"
                className="bg-white text-indigo-700 hover:bg-indigo-50 py-3 px-8 rounded-md font-medium"
              >
                Discord
              </a>
              <a
                href="#"
                className="bg-white text-indigo-700 hover:bg-indigo-50 py-3 px-8 rounded-md font-medium"
              >
                Twitter
              </a>
              <a
                href="#"
                className="bg-white text-indigo-700 hover:bg-indigo-50 py-3 px-8 rounded-md font-medium"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayToEarnPage;
