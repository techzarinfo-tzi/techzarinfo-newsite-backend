import Career from "../models/Career.js";
import ChatConversation from "../models/ChatConversation.js";
import Contact from "../models/Contact.js";
import Hire from "../models/Hire.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const stats = asyncHandler(async (req, res) => {
  const [users, blogs, careers, contact, developer, chats] = await Promise.all(
    [User, Post, Career, Contact, Hire, ChatConversation].map((Model) => Model.estimatedDocumentCount())
  );

  return res.json({
    usersCount: users,
    blogsCount: blogs,
    careersCount: careers,
    contactCount: contact,
    developerCount: developer,
    chatCount: chats,
  });
});
