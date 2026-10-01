import ChatConversation from "../models/ChatConversation.js";
import asyncHandler from "../utils/asyncHandler.js";

const DEFAULT_LIMIT = 20;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Newest first. `search` matches any question or answer in the conversation; `visitorId` keeps
// only one visitor's conversations. Each item carries only its first question, for the list preview.
export const list = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || DEFAULT_LIMIT;
  const { search, visitorId } = req.query;

  const filter = {};
  if (search) filter["messages.content"] = new RegExp(escapeRegex(search), "i");
  if (visitorId) filter.visitorId = visitorId;
  const filtered = Object.keys(filter).length > 0;

  const [items, total] = await Promise.all([
    ChatConversation.find(filter, {
      conversationId: 1,
      visitorId: 1,
      ip: 1,
      questionCount: 1,
      createdAt: 1,
      updatedAt: 1,
      messages: { $slice: 1 },
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    filtered
      ? ChatConversation.countDocuments(filter)
      : ChatConversation.estimatedDocumentCount(),
  ]);

  return res.json({
    status: 1,
    data: {
      items: items.map(({ messages, ...item }) => ({
        ...item,
        firstQuestion: messages?.[0]?.content ?? "",
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getById = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.id).lean();
  if (!conversation) {
    return res.status(404).json({ status: 0, message: "Not found" });
  }
  return res.json({ status: 1, data: conversation });
});
