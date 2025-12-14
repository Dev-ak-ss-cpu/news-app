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
    liveVideoId: {
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
