import { validationResult } from "express-validator";
import { discardUpload } from "./upload.js";

// Runs after a validator chain. Keeps the original response shape the
// frontend expects: HTTP 200 with { status: 0, errors: [...] }.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  discardUpload(req.file);
  return res.status(200).json({
    status: 0,
    // "param" is the pre-v7 express-validator name for "path", kept for
    // existing clients. The submitted value is left out so passwords aren't echoed.
    errors: errors.array().map(({ type, path, location, msg }) => ({
      type,
      msg,
      param: path,
      path,
      location,
    })),
  });
};

export default validate;
