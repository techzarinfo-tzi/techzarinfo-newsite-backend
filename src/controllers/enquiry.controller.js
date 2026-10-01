import { matchedData } from "express-validator";
import Contact from "../models/Contact.js";
import Hire from "../models/Hire.js";
import { sendEnquiry } from "../services/mail.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// Emails sales (with a copy to the visitor) and then stores the enquiry
const handleEnquiry = ({ Model, subject, template }) =>
  asyncHandler(async (req, res) => {
    const data = matchedData(req, { locations: ["body"] });

    try {
      await sendEnquiry({ subject, template, context: data });
    } catch (err) {
      console.error(`Failed to send "${subject}" email:`, err.message);
      return res.status(200).json({
        message: "We couldn't send your request, please try again later",
        status: 0,
      });
    }

    await Model.create(data);
    return res.status(200).json({
      message: "Your request sent successfully",
      status: 1,
    });
  });

const listAll = (Model) =>
  asyncHandler(async (req, res) => {
    const data = await Model.find().sort({ _id: -1 });
    return res.json(data);
  });

const remove = (Model, idParam) =>
  asyncHandler(async (req, res) => {
    const { deletedCount } = await Model.deleteOne({ _id: req.params[idParam] });
    if (!deletedCount) {
      return res.status(404).json({ status: 0, message: "Not found" });
    }
    return res.status(200).json({ status: 1, message: "deleted Successfully" });
  });

export const submitContact = handleEnquiry({
  Model: Contact,
  subject: "CONTACT US",
  template: "contact",
});
export const submitHireDeveloper = handleEnquiry({
  Model: Hire,
  subject: "HIRE A DEVELOPER",
  template: "hire-a-developer",
});
export const listContacts = listAll(Contact);
export const deleteContact = remove(Contact, "con_id");
export const listHires = listAll(Hire);
export const deleteHire = remove(Hire, "dev_id");
