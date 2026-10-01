import mongoose from "mongoose";

// Website chatbot conversations. Written by the AIChatbot service
// (AIChatbot/server/chatLog.js); this API only reads them for the admin panel.
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Assistant messages only: answered, refused, cut_off, failed or stopped
    status: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
  },
  { _id: false }
);

const chatConversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },
    // Anonymous ID kept in the visitor's browser (no login), shared by all their chats
    visitorId: {
      type: String,
    },
    // Visitor's IP address when they last asked something
    ip: {
      type: String,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    messages: [messageSchema],
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
      index: -1,
    },
  },
  {
    collection: "chatconversations",
  }
);

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

export default ChatConversation;
