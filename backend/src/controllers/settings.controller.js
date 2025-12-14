import { Settings } from "../models/settings.model.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
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
    const { breakingNewsExpiryHours, trendingNewsExpiryHours, liveVideoId } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        breakingNewsExpiryHours: breakingNewsExpiryHours || 24,
        trendingNewsExpiryHours: trendingNewsExpiryHours || 48,
        liveVideoId: liveVideoId || "",
      });
    } else {
      if (breakingNewsExpiryHours !== undefined) {
        settings.breakingNewsExpiryHours = breakingNewsExpiryHours;
      }
      if (trendingNewsExpiryHours !== undefined) {
        settings.trendingNewsExpiryHours = trendingNewsExpiryHours;
      }
      if (liveVideoId !== undefined) {
        settings.liveVideoId = liveVideoId;
      }
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating settings",
    });
  }
};
