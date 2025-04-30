import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const ContractAddresses = ({ tradingAddress, pokemonCardAddress, network }) => {
  const [copySuccess, setCopySuccess] = useState({
    trading: false,
    pokemon: false,
  });

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess({ ...copySuccess, [type]: true });

      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [type]: false });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getExplorerUrl = (address) => {
    // This would be updated based on the network you're using
    // For local development, there's usually no explorer
    if (network === "localhost" || network === "hardhat") {
      return null;
    }

    // For test networks
    if (network === "goerli") {
      return `https://goerli.etherscan.io/address/${address}`;
    }

    if (network === "sepolia") {
      return `https://sepolia.etherscan.io/address/${address}`;
    }

    // For mainnet
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Contract Addresses
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Trading Contract:
            </span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
              {network || "Unknown Network"}
            </span>
          </div>

          <div className="flex items-center">
            <code className="bg-gray-100 text-sm p-2 rounded flex-grow">
              {tradingAddress || "Not configured"}
            </code>

            <button
              onClick={() => handleCopy(tradingAddress, "trading")}
              className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
              title="Copy address"
              disabled={!tradingAddress}
            >
              {copySuccess.trading ? <Check size={16} /> : <Copy size={16} />}
            </button>

            {getExplorerUrl(tradingAddress) && (
              <a
                href={getExplorerUrl(tradingAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="View on block explorer"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Pokemon Card Contract:
            </span>
          </div>

          <div className="flex items-center">
            <code className="bg-gray-100 text-sm p-2 rounded flex-grow">
              {pokemonCardAddress || "Not configured"}
            </code>

            <button
              onClick={() => handleCopy(pokemonCardAddress, "pokemon")}
              className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
              title="Copy address"
              disabled={!pokemonCardAddress}
            >
              {copySuccess.pokemon ? <Check size={16} /> : <Copy size={16} />}
            </button>

            {getExplorerUrl(pokemonCardAddress) && (
              <a
                href={getExplorerUrl(pokemonCardAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="View on block explorer"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-gray-500">
          To update these addresses, modify the constants in Web3Context.jsx.
        </p>
      </div>
    </div>
  );
};

export default ContractAddresses;
