import { Settings } from "../models/settings.model.js";
import {
  extractYouTubeId,
  buildYouTubeUrl,
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnail,
} from "../utils/youtube.js";

// Adds the derived player URLs so the frontend never has to build them itself
const withVideoUrls = (settings) => {
  const data = settings.toObject ? settings.toObject() : { ...settings };
  const videoId = data.liveVideoId || "";

  return {
    ...data,
    liveVideoId: videoId,
    liveVideoUrl: data.liveVideoUrl || buildYouTubeUrl(videoId),
    liveVideoEmbedUrl: buildYouTubeEmbedUrl(videoId),
    liveVideoThumbnail: buildYouTubeThumbnail(videoId),
  };
};

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      success: true,
      data: withVideoUrls(settings),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching settings",
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      breakingNewsExpiryHours,
      trendingNewsExpiryHours,
      liveVideoUrl,
      liveVideoId,
    } = req.body;

    // The admin sends the full YouTube link; a bare ID still works for older clients
    const videoInput = liveVideoUrl !== undefined ? liveVideoUrl : liveVideoId;
    const hasVideoInput = videoInput !== undefined;

    let resolvedId = "";
    let resolvedUrl = "";

    if (hasVideoInput) {
      const trimmed = typeof videoInput === "string" ? videoInput.trim() : "";

      // An empty value clears the live stream
      if (trimmed) {
        resolvedId = extractYouTubeId(trimmed);

        if (!resolvedId) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid YouTube link. Paste a full video URL, e.g. https://www.youtube.com/watch?v=VIDEO_ID",
          });
        }

        resolvedUrl = buildYouTubeUrl(resolvedId);
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        breakingNewsExpiryHours: breakingNewsExpiryHours || 24,
        trendingNewsExpiryHours: trendingNewsExpiryHours || 48,
        liveVideoId: resolvedId,
        liveVideoUrl: resolvedUrl,
      });
    } else {
      if (breakingNewsExpiryHours !== undefined) {
        settings.breakingNewsExpiryHours = breakingNewsExpiryHours;
      }
      if (trendingNewsExpiryHours !== undefined) {
        settings.trendingNewsExpiryHours = trendingNewsExpiryHours;
      }
      if (hasVideoInput) {
        settings.liveVideoId = resolvedId;
        settings.liveVideoUrl = resolvedUrl;
      }
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: withVideoUrls(settings),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating settings",
    });
  }
};
