import React from "react";
import { Tag, ArrowUpDown, Clock } from "lucide-react";

const SaleTypeBadge = ({ saleType }) => {
  // Get badge color based on sale type
  const getBadgeColor = (type) => {
    switch (type) {
      case "FixedPrice":
        return "bg-blue-100 text-blue-800";
      case "EnglishAuction":
        return "bg-green-100 text-green-800";
      case "DutchAuction":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get icon based on sale type
  const getIcon = (type) => {
    switch (type) {
      case "FixedPrice":
        return <Tag className="h-4 w-4" />;
      case "EnglishAuction":
        return <ArrowUpDown className="h-4 w-4" />;
      case "DutchAuction":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`${getBadgeColor(
        saleType
      )} px-2 py-1 text-xs font-medium rounded-md flex items-center`}
    >
      {getIcon(saleType)}
      <span className="ml-1">{saleType}</span>
    </span>
  );
};

export default SaleTypeBadge;
