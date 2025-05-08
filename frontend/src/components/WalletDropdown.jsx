import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  LogOut,
  DollarSign,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import LoadingSpinner from "./LoadingSpinner";

const WalletDropdown = () => {
  const { account, disconnectWallet, tradingContract, provider } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingBalance, setPendingBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Fetch pending balance
  const fetchPendingBalance = async () => {
    if (!tradingContract || !account) return;

    try {
      setIsLoading(true);
      const balance = await tradingContract.pendingWithdrawals(account);

      // Use window.ethers or a fallback for formatting
      let formattedBalance = "0.0";
      if (window.ethers) {
        formattedBalance = window.ethers.utils.formatEther(balance);
      } else if (provider) {
        formattedBalance = provider.utils.formatEther(balance);
      }

      setPendingBalance(formattedBalance);
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
      setWithdrawSuccess(true);

      // Reset withdraw success message after 3 seconds
      setTimeout(() => {
        setWithdrawSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setError("Failed to withdraw funds");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Fetch balance when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchPendingBalance();
    }
  }, [isOpen, account, tradingContract]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!account) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        {formatAddress(account)}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 divide-y divide-gray-200">
            {/* Header */}
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900">
                Connected Wallet
              </p>
              <p className="text-xs text-gray-500 mt-1 break-all">{account}</p>
            </div>

            {/* Pending Balance */}
            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900">
                  Pending Balance
                </p>
                {isLoading ? (
                  <LoadingSpinner size="small" color="indigo" />
                ) : (
                  <button
                    onClick={fetchPendingBalance}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                <p className="text-lg font-bold text-gray-900">
                  {pendingBalance} ETH
                </p>
              </div>

              {/* Withdraw Button */}
              {parseFloat(pendingBalance) > 0 && (
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isWithdrawing ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    "Withdraw Funds"
                  )}
                </button>
              )}

              {/* Success Message */}
              {withdrawSuccess && (
                <div className="mt-2 p-2 bg-green-50 text-green-800 text-xs rounded-md">
                  Funds successfully withdrawn to your wallet!
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded-md">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3">
              <a
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </a>

              <button
                onClick={disconnectWallet}
                className="w-full mt-2 flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDropdown;
