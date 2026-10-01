import Career from "../models/Career.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  await Career.create({ title, message });
  return res.status(200).json({
    message: "Your post saved successfully",
    status: 1,
  });
});

export const list = asyncHandler(async (req, res) => {
  const data = await Career.find().sort({ _id: -1 });
  return res.json(data);
});

export const getById = asyncHandler(async (req, res) => {
  const career = await Career.findById(req.params.id);
  if (!career) return res.status(404).json({ status: 0 });
  return res.json(career);
});

export const update = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const career = await Career.findByIdAndUpdate(
    req.params.id,
    { $set: { title, message } },
    { runValidators: true }
  );
  if (!career) {
    return res.status(404).json({ message: "Career not found", status: 0 });
  }
  return res.status(200).json({
    message: "Your post saved successfully",
    status: 1,
  });
});

export const remove = asyncHandler(async (req, res) => {
  const { deletedCount } = await Career.deleteOne({ _id: req.params.careers_id });
  if (!deletedCount) {
    return res.status(404).json({ status: 0, message: "Not found" });
  }
  return res.status(200).json({ status: 1, message: "deleted Successfully" });
});
