import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import config from "../config/index.js";
import escapeHtml from "../utils/escapeHtml.js";

const transporter = nodemailer.createTransport({
  service: config.mail.service,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

const templateCache = new Map();

const renderTemplate = (name, context) => {
  if (!templateCache.has(name)) {
    const source = fs.readFileSync(
      path.join(config.paths.emailViews, `${name}.hbs`),
      "utf8"
    );
    templateCache.set(name, Handlebars.compile(source));
  }
  // {{ }} in the templates HTML-escapes every value
  return templateCache.get(name)(context);
};

// Notifies sales about a website enquiry and sends the visitor a copy.
// The visitor's address goes in replyTo, never in "from": the mailbox can't
// send as arbitrary addresses and doing so would look like spoofing.
export const sendEnquiry = ({ subject, template, context }) =>
  transporter.sendMail({
    from: config.mail.user,
    to: config.mail.salesAddress,
    bcc: context.email,
    replyTo: context.email,
    subject,
    html: renderTemplate(template, context),
  });

export const sendPasswordReset = ({ to, name, resetLink }) => {
  const link = escapeHtml(resetLink);
  return transporter.sendMail({
    from: config.mail.user,
    to,
    subject: "Password Reset Request",
    html: `<p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your password. Click the link below to set a new one:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  });
};
