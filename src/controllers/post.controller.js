import fs from "node:fs";
import path from "node:path";
import { matchedData } from "express-validator";
import config from "../config/index.js";
import Post from "../models/Post.js";
import { discardUpload } from "../middleware/upload.js";
import asyncHandler from "../utils/asyncHandler.js";

const newestFirst = { _id: -1 };

const postFields = (req) => {
  const data = matchedData(req, { locations: ["body"] });
  return {
    meta_title: data.meta_title.toLowerCase(),
    meta_description: data.meta_description,
    keywords: data.keywords.toLowerCase(),
    title: data.title.toLowerCase(),
    slug: data.slug.toLowerCase(),
    schema: data.schema,
    message: data.message,
    type: data.type,
  };
};

const deleteImage = (filename) => {
  if (!filename) return;
  // basename() keeps a bad DB value from pointing outside the uploads folder
  fs.unlink(path.join(config.paths.uploads, path.basename(filename)), () => {});
};

export const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(200).json({ message: "Image is required", status: 0 });
  }

  const fields = postFields(req);
  if (await Post.exists({ title: fields.title })) {
    discardUpload(req.file);
    return res.status(409).json({ message: "Title Already Exists", status: 0 });
  }

  await Post.create({ ...fields, image: req.file.filename });
  return res.status(200).json({
    message: "Your post saved successfully",
    status: 1,
  });
});

// The image is only replaced when a new file is uploaded
export const update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    discardUpload(req.file);
    return res.status(404).json({ message: "Post not found", status: 0 });
  }

  const oldImage = post.image;
  post.set(postFields(req));
  if (req.file) post.image = req.file.filename;
  await post.save();

  if (req.file && oldImage !== post.image) deleteImage(oldImage);

  return res.status(200).json({
    message: "Your post updated successfully",
    status: 1,
  });
});

export const listAll = asyncHandler(async (req, res) => {
  const data = await Post.find().sort(newestFirst);
  return res.status(200).json(data);
});

export const listByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const data =
    type === "Home"
      ? await Post.find().sort(newestFirst).limit(4)
      : await Post.find({ type }).sort(newestFirst).limit(3);
  return res.status(200).json(data);
});

export const listPage = asyncHandler(async (req, res) => {
  const { limit, page } = req.params;
  const data = await Post.find()
    .sort(newestFirst)
    .skip((page - 1) * limit)
    .limit(limit);
  return res.status(200).json(data);
});

export const listPageByType = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.params.limit, 10) || 8, 1), 100);
  const page = Math.max(parseInt(req.params.page, 10) || 1, 1);
  const { type } = req.params;
  const filter = type === "all" ? {} : { type: String(type) };
  const data = await Post.find(filter)
    .sort(newestFirst)
    .skip((page - 1) * limit)
    .limit(limit);
  return res.status(200).json(data);
});

export const listHome = asyncHandler(async (req, res) => {
  const data = await Post.find().sort(newestFirst).limit(3);
  return res.json(data);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: String(req.params.post_title) });
  if (!post) return res.status(404).json({ status: 0 });
  return res.json(post);
});

export const getById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return res.status(404).json({ status: 0 });
  return res.json(post);
});

export const remove = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.post_id);
  if (!post) {
    return res.status(404).json({ status: 0, message: "Not found" });
  }
  deleteImage(post.image);
  return res.status(200).json({ status: 1, message: "deleted Successfully" });
});
