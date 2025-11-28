import { API_URL } from "../services/apiService";

/**
 * Gets the base URL for image resources
 * Extracts the base URL from API_URL (removes /api suffix)
 * @returns {string} Base URL for images
 */
export const getImageBaseUrl = () => {
  if (!API_URL) {
    // Fallback for development
    return "http://localhost:8081";
  }
  
  try {
    // Parse the API_URL to get the origin
    const url = new URL(API_URL);
    return url.origin; // Returns protocol + hostname + port (e.g., "https://stayease-95v6.onrender.com")
  } catch (e) {
    // Fallback: Remove /api from the end if present
    const baseUrl = API_URL.replace(/\/api\/?$/, "");
    return baseUrl;
  }
};

/**
 * Constructs a full image URL from a relative path
 * @param {string} imagePath - Relative image path (e.g., "uploads/profile_pictures/image.png")
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Construct full URL from relative path
  const baseUrl = getImageBaseUrl();
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

