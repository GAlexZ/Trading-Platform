// utils/ipfsHelper.js

/**
 * Resolves an IPFS URI to an HTTP URL that can be used in an <img> tag
 * @param {string} uri - The URI to resolve (can be ipfs://, http://, etc)
 * @returns {string} - A URL that can be used in an <img> tag
 */
export const resolveIPFS = (uri) => {
  if (!uri) return "/api/placeholder/300/400";

  // Handle ipfs:// protocol
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }

  // Handle ipfs path format /ipfs/Qm...
  if (uri.startsWith("/ipfs/")) {
    return `https://ipfs.io${uri}`;
  }

  // Already a HTTP URL or other format, return as is
  return uri;
};

/**
 * Creates a placeholder image URL with the given text
 * @param {string} text - Text to display on the placeholder image
 * @returns {string} - A URL for a placeholder image
 */
export const createPlaceholder = (text) => {
  return `/api/placeholder/300/400?text=${encodeURIComponent(
    text || "Pokemon"
  )}`;
};
