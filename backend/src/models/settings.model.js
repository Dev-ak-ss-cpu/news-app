import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    breakingNewsExpiryHours: {
      type: Number,
      default: 24, // Default 24 hours
      min: 1,
    },
    trendingNewsExpiryHours: {
      type: Number,
      default: 48, // Default 48 hours
      min: 1,
    },
    // Extracted from liveVideoUrl — kept so the player can embed directly
    liveVideoId: {
      type: String,
      default: "",
      trim: true,
    },
    // The full YouTube link the admin pasted, normalised to a watch URL
    liveVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const Settings = mongoose.model("Settings", settingsSchema);
