import mongoose from "mongoose";

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
    this.slug = slugify(this.name, { lower: true, strict: true });
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
