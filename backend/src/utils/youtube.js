// YouTube video IDs are always 11 chars of [A-Za-z0-9_-]
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = [
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
];

// youtube.com/<prefix>/VIDEO_ID style paths
const PATH_PREFIXES = ["live", "embed", "shorts", "v", "e"];

/**
 * Pulls the video ID out of any YouTube link the admin might paste.
 *
 * Supported:
 *   https://www.youtube.com/watch?v=VIDEO_ID (with any extra query params)
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://m.youtube.com/watch?v=VIDEO_ID
 *   youtube.com/watch?v=VIDEO_ID  (no protocol)
 *   VIDEO_ID                      (bare id, for backward compatibility)
 *
 * @returns {string|null} the video ID, or null if the input isn't a YouTube link
 */
export const extractYouTubeId = (input) => {
  if (!input || typeof input !== "string") return null;

  const value = input.trim();
  if (!value) return null;

  // Already a bare video ID
  if (VIDEO_ID_PATTERN.test(value)) return value;

  // Prepend protocol so inputs like "youtu.be/abc" still parse
  const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  let url;
  try {
    url = new URL(normalized);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (!ALLOWED_HOSTS.includes(host)) return null;

  // youtu.be/VIDEO_ID
  if (host === "youtu.be") {
    const [id] = url.pathname.split("/").filter(Boolean);
    return VIDEO_ID_PATTERN.test(id || "") ? id : null;
  }

  // youtube.com/watch?v=VIDEO_ID
  const queryId = url.searchParams.get("v");
  if (queryId && VIDEO_ID_PATTERN.test(queryId)) return queryId;

  // youtube.com/live|embed|shorts|v/VIDEO_ID
  const [prefix, id] = url.pathname.split("/").filter(Boolean);
  if (prefix && PATH_PREFIXES.includes(prefix.toLowerCase())) {
    return VIDEO_ID_PATTERN.test(id || "") ? id : null;
  }

  return null;
};

/** Canonical watch URL for a video ID. */
export const buildYouTubeUrl = (videoId) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

/** Embeddable player URL for a video ID. */
export const buildYouTubeEmbedUrl = (videoId) =>
  videoId ? `https://www.youtube.com/embed/${videoId}` : "";

/** Thumbnail URL for a video ID. */
export const buildYouTubeThumbnail = (videoId) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
