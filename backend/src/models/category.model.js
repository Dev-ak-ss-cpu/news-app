import mongoose from "mongoose";
import { transliterate } from "transliteration";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ parent: 1 });

categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

categorySchema.methods.getFullPath = async function () {
  const path = [this.name];
  let current = this;

  while (current.parent) {
    current = await mongoose.model("Category").findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(" > ");
};

categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const slugify = (await import("slugify")).default;
    
    // First transliterate Hindi to English
    let transliteratedName = transliterate(this.name, { 
      unknown: '' // Remove unknown characters
    });
    
    // Clean up the transliterated text
    transliteratedName = transliteratedName.trim();
    
    // Then slugify the transliterated text
    this.slug = slugify(transliteratedName, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // If slug is empty or too short after transliteration, use a fallback
    if (!this.slug || this.slug.trim().length === 0) {
      this.slug = `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Ensure slug is unique
    const existingCategory = await mongoose.model("Category").findOne({ 
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      let counter = 1;
      let uniqueSlug = `${this.slug}-${counter}`;
      while (await mongoose.model("Category").findOne({ slug: uniqueSlug })) {
        counter++;
        uniqueSlug = `${this.slug}-${counter}`;
      }
      this.slug = uniqueSlug;
    }
  }

  if (this.parent) {
    const parentCategory = await mongoose
      .model("Category")
      .findById(this.parent);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else {
    this.level = 0;
  }

  next();
});

categorySchema.pre("save", async function (next) {
  if (this.parent && this.parent.toString() === this._id.toString()) {
    return next(new Error("Category cannot be its own parent"));
  }

  if (this.parent) {
    const parentExists = await mongoose.model("Category").findById(this.parent);
    if (!parentExists) {
      return next(new Error("Parent category does not exist"));
    }
  }

  next();
});

export const Category = mongoose.model("Category", categorySchema);
