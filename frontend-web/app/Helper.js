import axios from "axios";
import BASE_API_URL from "./api-config";
// Remove: import { getAuthToken } from "./utils/auth";

// --------------------Api Helpers Function -------------------
export async function genericPostApi(endpoint, params) {
  try {
    // Remove token logic
    const { data } = await axios.post(`${BASE_API_URL}${endpoint}`, params, {
      withCredentials: true,
      headers: {},
    });
    return data;
  } catch (error) {
    console.log("Getting error in Post request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericGetApi(endpoint, params) {
  try {
    // Remove token logic
    const { data } = await axios.get(`${BASE_API_URL}${endpoint}`, {
      params: params,
      withCredentials: true,
      headers: {},
    });
    return data;
  } catch (error) {
    console.log("Getting error in Get request");
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPostApiWithFile(endpoint, formData) {
  try {
    // Remove token logic
    const headers = {
      "Content-Type": "multipart/form-data",
    };

    const { data } = await axios.post(`${BASE_API_URL}${endpoint}`, formData, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Post request with file", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPutApiWithFile(endpoint, formData) {
  try {
    // Remove token logic
    const headers = {
      "Content-Type": "multipart/form-data",
    };

    const { data } = await axios.put(`${BASE_API_URL}${endpoint}`, formData, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Put request with file", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPutApi(endpoint, params) {
  try {
    // Remove token logic
    const { data } = await axios.put(`${BASE_API_URL}${endpoint}`, params, {
      withCredentials: true,
      headers: {},
    });
    return data;
  } catch (error) {
    console.log("Getting error in Put request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericDeleteApi(endpoint, params) {
  try {
    // Remove token logic
    const { data } = await axios.delete(`${BASE_API_URL}${endpoint}`, {
      data: params,
      withCredentials: true,
      headers: {},
    });
    return data;
  } catch (error) {
    console.log("Getting error in Delete request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
};

export const getYouTubeId = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

export async function genericGetApiSSR(url, params = {}) {
  const search = new URLSearchParams(params).toString();
  const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE}${url}?${search}`;

  try {
    const res = await fetch(fullUrl, {
      method: "GET",
      cache: "no-store",
    });

    return await res.json();
  } catch (error) {
    console.error("SSR fetch error:", error);
    return { success: false, message: "Server fetch failed" };
  }
}

/**
 * Strips HTML tags from content
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
const stripHtmlTags = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
  } else {
    // Fallback for SSR
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

/**
 * Generates SEO-optimized meta title from article title
 * @param {string} title - Article title
 * @param {number} maxLength - Maximum length (default: 60, recommended: 50-60)
 * @returns {string} - Optimized meta title
 */
export const generateMetaTitle = (title, maxLength = 60) => {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // Trim and remove extra spaces
  let metaTitle = title.trim().replace(/\s+/g, ' ');

  // If title is within limit, return as is
  if (metaTitle.length <= maxLength) {
    return metaTitle;
  }

  // Truncate at word boundary
  const truncated = metaTitle.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
};

/**
 * Generates SEO-optimized meta description from excerpt or content
 * @param {string} excerpt - Article excerpt (preferred)
 * @param {string} content - Article content (fallback)
 * @param {number} maxLength - Maximum length (default: 160, recommended: 150-160)
 * @returns {string} - Optimized meta description
 */
export const generateMetaDescription = (excerpt, content = '', maxLength = 160) => {
  let text = '';

  // Prefer excerpt over content
  if (excerpt && typeof excerpt === 'string' && excerpt.trim()) {
    text = excerpt.trim();
  } else if (content && typeof content === 'string' && content.trim()) {
    // Strip HTML from content
    text = stripHtmlTags(content);
  }

  if (!text) {
    return '';
  }

  // Remove extra spaces
  text = text.replace(/\s+/g, ' ');

  // If text is within limit, return as is
  if (text.length <= maxLength) {
    return text;
  }

  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
};

/**
 * Auto-generates both meta title and description
 * @param {string} title - Article title
 * @param {string} excerpt - Article excerpt
 * @param {string} content - Article content
 * @returns {object} - Object with metaTitle and metaDescription
 */
export const generateMetaTags = (title, excerpt = '', content = '') => {
  return {
    metaTitle: generateMetaTitle(title),
    metaDescription: generateMetaDescription(excerpt, content),
  };
};
