import React from "react";
import { Tag, ArrowUpDown, Clock } from "lucide-react";
import SaleTypeBadge from "./SaleTypeBadge";
import { useWeb3 } from "../context/Web3Context";
import IPFSImage from "./IPFSImage"; // Import our new component

const NftCard = ({ listing, onClick }) => {
  // Get the current account from Web3Context
  const { account } = useWeb3();

  // Check if the current user is the seller of this listing
  const isUserSeller =
    account && listing.seller.toLowerCase() === account.toLowerCase();

  // Format price display with ETH symbol
  const formatPrice = (price) => {
    return `${price} ETH`;
  };

  // Calculate time remaining for auctions
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.now();

    if (total <= 0) {
      return { expired: true, timeString: "Expired" };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return { expired: false, timeString: `${days}d ${hours}h remaining` };
    } else if (hours > 0) {
      return { expired: false, timeString: `${hours}h ${minutes}m remaining` };
    } else {
      return {
        expired: false,
        timeString: `${minutes}m ${seconds}s remaining`,
      };
    }
  };

  const timeRemaining = listing.endTime
    ? getTimeRemaining(listing.endTime)
    : null;

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Replace the img tag with our IPFSImage component */}
        <IPFSImage
          uri={listing.tokenURI || listing.image}
          alt={listing.name}
          fallbackText={listing.name || "Pokemon"}
          className="card-grid"
        />

        {listing.isShiny && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-800 text-xs font-medium rounded-md">
            ✨ Shiny
          </span>
        )}
        <div className="absolute bottom-2 left-2">
          <SaleTypeBadge saleType={listing.saleType} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{listing.name}</h3>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Gen {listing.generation}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {listing.type}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Power: {listing.power}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            {"⭐".repeat(listing.rarity)}
          </span>
        </div>

        {/* Show auction timer for auctions */}
        {(listing.saleType === "EnglishAuction" ||
          listing.saleType === "DutchAuction") &&
          timeRemaining && (
            <div className="mt-2">
              <span
                className={`text-xs ${
                  timeRemaining.expired ? "text-red-600" : "text-gray-500"
                }`}
              >
                {timeRemaining.timeString}
              </span>
            </div>
          )}

        <div className="mt-3 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              {listing.saleType === "EnglishAuction" ? "Current bid" : "Price"}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(listing.currentPrice)}
            </p>
          </div>

          {/* Conditionally render different buttons based on whether user is seller */}
          {isUserSeller ? (
            <button
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onClick();
              }}
            >
              Cancel
            </button>
          ) : (
            <button
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onClick();
              }}
            >
              {listing.saleType === "FixedPrice"
                ? "Buy Now"
                : listing.saleType === "EnglishAuction"
                ? "Place Bid"
                : "Buy Now"}
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>
            Seller:{" "}
            {`${listing.seller.substring(0, 6)}...${listing.seller.substring(
              listing.seller.length - 4
            )}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
