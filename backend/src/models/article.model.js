import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Article content is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    featuredImage: {
      type: String,
      default: "",
    },
    youtubeVideo: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ category: 1, status: 1, publishDate: -1 });
articleSchema.index({ status: 1, publishDate: -1 });
articleSchema.index({ isBreaking: 1 });
articleSchema.index({ isTrending: 1 });

articleSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    const slugify = (await import("slugify")).default;
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Article = mongoose.model("Article", articleSchema);
