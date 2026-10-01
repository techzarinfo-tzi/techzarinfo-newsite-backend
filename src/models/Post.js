import mongoose from "mongoose";

export const POST_TYPES = [
  "Mobile app",
  "Web app",
  "Sass product",
  "E-commerce",
  "Digital marketing",
  "Robotics process",
  "Artificial intelligence",
  "Internet of things",
  "Machine learning",
  "Enterprises software solutions",
  "Business automation",
  "ERP",
  "CRM",
  "LMS",
  "SMS",
  "ZAAR",
  "CMMS",
];

const postSchema = new mongoose.Schema(
  {
    meta_title: {
      type: String,
      unique: true,
      required: true,
    },
    meta_description: {
      type: String,
      unique: true,
      required: true,
    },
    keywords: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    schema: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: POST_TYPES,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
