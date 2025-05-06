import React, { useState } from "react";
import { resolveIPFS, createPlaceholder } from "../utils/ipfsHelper";

/**
 * IPFSImage Component
 *
 * A reusable component that handles IPFS images with consistent scaling
 *
 * @param {Object} props
 * @param {string} props.uri - The IPFS URI or image source
 * @param {string} props.alt - Alt text for the image
 * @param {boolean} props.isDetail - Whether this is a detail view (larger format)
 * @param {string} props.className - Additional classes to apply to the container
 * @param {Object} props.containerStyle - Additional inline styles for container
 * @param {Object} props.imageStyle - Additional inline styles for the image
 * @param {string} props.fallbackText - Text to show on the placeholder if image fails
 * @param {function} props.onLoad - Callback when image loads successfully
 * @param {function} props.onError - Callback when image fails to load
 */
const IPFSImage = ({
  uri,
  alt = "Pokemon Card",
  isDetail = false,
  className = "",
  containerStyle = {},
  imageStyle = {},
  fallbackText = "Pokemon",
  onLoad = () => {},
  onError = () => {},
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Resolve IPFS URI to HTTP URL
  const imageUrl = uri ? resolveIPFS(uri) : createPlaceholder(fallbackText);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError();
  };

  return (
    <div className={`ipfs-image-container ${className}`} style={containerStyle}>
      <img
        src={hasError ? createPlaceholder(fallbackText) : imageUrl}
        alt={alt}
        className={`${isDetail ? "ipfs-image-detail" : "ipfs-image"} ${
          isLoaded ? "loaded" : ""
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={imageStyle}
      />
    </div>
  );
};

export default IPFSImage;
