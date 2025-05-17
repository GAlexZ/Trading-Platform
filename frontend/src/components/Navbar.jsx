import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Wallet,
  Shield,
  Collection,
  DollarSign,
  ExternalLink,
  LogOut,
  GameController,
  Sparkles, // New icon for token price
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import WalletDropdown from "./WalletDropdown";
import LoadingSpinner from "./LoadingSpinner";
import { ethers } from "ethers";

// Mobile version of the wallet options
const MobileWalletOptions = ({ onClose }) => {
  const { account, disconnectWallet, tradingContract } = useWeb3();
  const [pendingBalance, setPendingBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch pending balance
  const fetchPendingBalance = async () => {
    if (!tradingContract || !account) return;

    try {
      setIsLoading(true);
      const balance = await tradingContract.pendingWithdrawals(account);
      setPendingBalance(balance ? ethers.utils.formatEther(balance) : "0.0");
    } catch (error) {
      console.error("Error fetching pending balance:", error);
      setError("Failed to fetch your balance");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw funds
  const handleWithdraw = async () => {
    if (!tradingContract || parseFloat(pendingBalance) <= 0) return;

    try {
      setIsWithdrawing(true);
      setError("");
      const tx = await tradingContract.withdraw();
      await tx.wait();

      setPendingBalance("0.0");
      setSuccess("Funds successfully withdrawn!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setError("Failed to withdraw funds");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Fetch balance on mount
  useEffect(() => {
    fetchPendingBalance();
  }, [account, tradingContract]);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-900">Pending Balance</p>
          {isLoading ? (
            <LoadingSpinner size="small" color="indigo" />
          ) : (
            <button
              onClick={fetchPendingBalance}
              className="text-xs text-indigo-600"
            >
              Refresh
            </button>
          )}
        </div>

        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
          <p className="text-lg font-semibold text-gray-900">
            {pendingBalance} ETH
          </p>
        </div>

        {parseFloat(pendingBalance) > 0 && (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isWithdrawing ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-1" />
                Withdraw Funds
              </>
            )}
          </button>
        )}

        {error && (
          <div className="mt-2 p-2 text-xs text-red-800 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-2 p-2 text-xs text-green-800 bg-green-50 rounded-md">
            {success}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 flex flex-col space-y-2">
        <a
          href={`https://etherscan.io/address/${account}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Etherscan
        </a>

        <button
          onClick={() => {
            disconnectWallet();
            if (onClose) onClose();
          }}
          className="flex items-center px-2 py-1.5 text-sm text-red-700 hover:bg-red-50 rounded-md"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const { account, connectWallet, isConnecting, pokemonCardContract } =
    useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  // Check if the current connected account is the contract owner
  const checkOwnership = async () => {
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
  };

  // Call the ownership check whenever the account or contract changes
  React.useEffect(() => {
    checkOwnership();
  }, [account, pokemonCardContract]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to marketplace with search query
    window.location.href = `/marketplace?search=${encodeURIComponent(
      searchQuery
    )}`;
  };

  return (
    <nav className="bg-white shadow-sm">
      {/* Token Ticker - NEW */}
      <div className="bg-indigo-800 text-white py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
          <div className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
            <span className="text-sm font-medium">$POKETOKEN:</span>
            <span className="ml-2 text-sm font-bold text-green-400">
              $0.0325
            </span>
            <span className="ml-2 bg-green-500 text-xs px-1.5 py-0.5 rounded-full font-medium">
              +8.2%
            </span>
          </div>
          <div className="text-xs hidden sm:block">
            CA: 0xeB3a9C56d963b4D9A761388D6e05eD9440C240e3
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                PokeTrade
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  location.pathname === "/"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`${
                  location.pathname === "/marketplace" ||
                  location.pathname.includes("/marketplace/")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Marketplace
              </Link>
              {/* NEW: Play to Earn Link */}
              <Link
                to="/play-to-earn"
                className={`${
                  location.pathname === "/play-to-earn"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <GameController className="h-4 w-4 mr-1" />
                Play to Earn
              </Link>
              {/* Collection Link - Only show when connected */}
              {account && (
                <Link
                  to="/collection"
                  className={`${
                    location.pathname === "/collection"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  My Collection
                </Link>
              )}
              {/* Admin Link - Only show when connected AND account is contract owner */}
              {account && isOwner && (
                <Link
                  to="/admin"
                  className={`${
                    location.pathname === "/admin"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <div className="flex space-x-4">
                <form
                  onSubmit={handleSearch}
                  className="relative rounded-md shadow-sm"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    placeholder="Search Pokemon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Replace the account display with WalletDropdown when connected */}
                {account ? (
                  <WalletDropdown />
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isConnecting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`${
                location.pathname === "/"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`${
                location.pathname === "/marketplace" ||
                location.pathname.includes("/marketplace/")
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            {/* NEW: Play to Earn Link in mobile menu */}
            <Link
              to="/play-to-earn"
              className={`${
                location.pathname === "/play-to-earn"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <GameController className="h-4 w-4 mr-2" />
              Play to Earn
            </Link>
            {/* Collection Link in Mobile Menu - Only show when connected */}
            {account && (
              <Link
                to="/collection"
                className={`${
                  location.pathname === "/collection"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Collection
              </Link>
            )}
            {/* Admin Link in Mobile Menu - Only show when connected AND account is contract owner */}
            {account && isOwner && (
              <Link
                to="/admin"
                className={`${
                  location.pathname === "/admin"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {account ? (
                <div className="flex items-center py-2 text-sm font-medium text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {`${account.substring(0, 6)}...${account.substring(
                    account.length - 4
                  )}`}
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
            <div className="mt-3 px-2">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 border-gray-300 rounded-md py-2 text-sm"
                  placeholder="Search Pokemon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Mobile wallet options */}
              {account && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="block px-3 py-2 rounded-md">
                    <MobileWalletOptions
                      onClose={() => setMobileMenuOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
