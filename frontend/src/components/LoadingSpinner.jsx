import React from "react";

const LoadingSpinner = ({ size = "medium", color = "indigo" }) => {
  // Size classes
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  };

  // Color classes
  const colorClasses = {
    indigo: "border-indigo-500",
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    gray: "border-gray-500",
    white: "border-white",
  };

  // Get the appropriate size and color classes
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div
      className={`animate-spin rounded-full ${spinnerSize} border-t-transparent ${spinnerColor}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
