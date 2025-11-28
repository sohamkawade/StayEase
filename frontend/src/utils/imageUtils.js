import { API_URL } from "../services/apiService";

export const getImageBaseUrl = () => {
  if (!API_URL) {
    return "http://localhost:8081";
  }
  
  try {
    const url = new URL(API_URL);
    return url.origin;
  } catch (e) {
    const baseUrl = API_URL.replace(/\/api\/?$/, "");
    return baseUrl;
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  const baseUrl = getImageBaseUrl();
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

