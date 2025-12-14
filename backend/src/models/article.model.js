import mongoose from "mongoose";
import { transliterate } from "transliteration";

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
    categoryPath: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category',
      default: []
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
      enum: [0, 1, 2],
      default: 0,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTopStory: {
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
    breakingExpiresAt: {
      type: Date,
      default: null,
    },
    trendingExpiresAt: {
      type: Date,
      default: null,
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
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ isTopStory: 1 });
articleSchema.index({ breakingExpiresAt: 1 });
articleSchema.index({ trendingExpiresAt: 1 });

articleSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    const slugify = (await import("slugify")).default;
    
    // First transliterate Hindi to English
    let transliteratedTitle = transliterate(this.title, { 
      unknown: '' // Remove unknown characters instead of replacing with [?]
    });
    
    // Clean up the transliterated text - remove any remaining special characters
    transliteratedTitle = transliteratedTitle.trim();
    
    // Then slugify the transliterated text
    this.slug = slugify(transliteratedTitle, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // If slug is empty or too short after transliteration, use a fallback
    if (!this.slug || this.slug.trim().length === 0) {
      // Use a combination of timestamp and random string
      this.slug = `article-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Ensure slug is unique by checking if it already exists
    const existingArticle = await mongoose.model("Article").findOne({ 
      slug: this.slug,
      _id: { $ne: this._id } // Exclude current document if updating
    });
    
    if (existingArticle) {
      // Append a number to make it unique
      let counter = 1;
      let uniqueSlug = `${this.slug}-${counter}`;
      while (await mongoose.model("Article").findOne({ slug: uniqueSlug })) {
        counter++;
        uniqueSlug = `${this.slug}-${counter}`;
      }
      this.slug = uniqueSlug;
    }
  }
  next();
});

export const Article = mongoose.model("Article", articleSchema);
