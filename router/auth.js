const express = require("express");
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const Contact = require("../model/Contact");
const Hire = require("../model/Hire");
const Post = require("../model/Post");
const Career = require("../model/Careers");
const multer = require("multer");
const Register = require("../model/Register");
const upload = multer({ dest: "./public/uploads/" });
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verify } = crypto;
const cookieParser = require("cookie-parser");

// verify
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    // if (bearerHeader) {
    const token = req.headers["authorization"].split("/")[1];
    jwt.verify(token, "techzarinfo", (err, user) => {
      console.log(err);
      if (err) {
        return res?.status(500).json({ message: "Token Wrong!" });
      } else {
        next();
      }
    });
    // }
  } else {
    //next();
    res?.status(400).json({ message: "Bad request!" });
  }
}

// CONTACT US
router.post(
  "/store-data",
  [
    check("name", "Name is required"),
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("phone", "Phone number is required")
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 15 })
      .withMessage("Phone no. must be 10 digits"),
    check("country", "Country is required").not().isEmpty(),
    check("service", "Service is required").not().isEmpty(),
    check("message", "Message is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }
      const hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");
      const request = req.body;

      // initialize nodemailer
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sales@techzarinfo.com",
          pass: "qjmogduymchvbhrt",
        },
      });

      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };

      // use a template file with nodemailer
      transporter.use("compile", hbs(handlebarOptions));

      var mailOptions = {
        from: request.email,
        to: "sales@techzarinfo.com",
        bcc: request.email,
        subject: "CONTACT US",
        template: "contact", // the name of the template file i.e email.handlebars
        context: {
          name: request.name,
          phone: request.phone,
          email: request.email,
          country: request.country,
          service: request.service,
          message: request.message,
        },
      };

      // trigger the sending of the E-mail
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          return res.status(200).json({
            message: error.message,
            status: 0,
          });
        } else {
          const contact = new Contact(request);

          let response = await contact.save();

          if (response) {
            return res.status(200).json({
              message: "Your request sent successfully",
              status: 1,
            });
          } else {
            return res.status(200).json({
              message: err.message,
              status: 0,
            });
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  }
);

// CONTACT US - POPUP
router.post(
  "/contact-popup",
  [
    check("name", "Name is required"),
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("phone", "Mobile number is required").not().isEmpty(),
    check("service", "Service is required").not().isEmpty(),
    check("message", "Message is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }
      const hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");
      const request = req.body;

      // initialize nodemailer
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sales@techzarinfo.com",
          pass: "qjmogduymchvbhrt",
        },
      });

      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };

      // use a template file with nodemailer
      transporter.use("compile", hbs(handlebarOptions));

      var mailOptions = {
        from: request.email,
        to: "sales@techzarinfo.com",
        bcc: request.email,
        subject: "CONTACT US",
        template: "contact", // the name of the template file i.e email.handlebars
        context: {
          name: request.name,
          phone: request.phone,
          email: request.email,
          service: request.service,
          message: request.message,
        },
      };

      // trigger the sending of the E-mail
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          return res.status(200).json({
            message: error.message,
            status: 0,
          });
        } else {
          const contact = new Contact(request);

          let response = await contact.save();

          if (response) {
            return res.status(200).json({
              message: "Your request sent successfully",
              status: 1,
            });
          } else {
            return res.status(200).json({
              message: err.message,
              status: 0,
            });
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  }
);
// Get-contact
router.get("/get-contact", verifyToken, async (req, res) => {
  try {
    const data = await Contact.find().sort({ $natural: -1 });
    if (data) {
      return res.json(data);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});

//Delete-contact
router.get("/delete-contact/:con_id", verifyToken, async (req, res) => {
  deleteresponse = await Contact.deleteOne({ _id: req.params.con_id });
  if (deleteresponse) {
    return res.status(500).json({
      status: 1,
      message: "deleted Successfully",
    });
  } else {
    return res.status(500).json({
      status: 0,
      message: "deleted unSuccessfully",
    });
  }
});

//Register
router.post(
  "/store-register",
  [
    check("name", "Full Name is required")
      .not()
      .isEmpty()
      .withMessage("Full Name must be at least 6 chars long"),
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("password", "password is required")
      .not()
      .isEmpty()
      .withMessage("password"),
  ],
  async (req, res) => {
    let verify_email = req.body.email;
    let verify = await Register.findOne({ email: verify_email });
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    var regUser = new Register({
      name: req.body.name,
      email: req.body.email,
      password: hashedPwd,
    });
    if (!verify) {
      let response = await regUser.save();
      if (response) {
        return res.status(200).json({
          message: "Your request sent successfully",
          status: 1,
        });
      } else {
        return res.status(200).json({
          message: err.message,
          status: 0,
        });
      }
    } else {
      return res.status(200).json({
        message: "Your email is Already Exists",
        status: 0,
      });
    }
  }
);
//Login
router.post(
  "/store-login",
  [
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("password", "password is required")
      .not()
      .isEmpty()
      .withMessage("password"),
  ],
  async (req, res) => {
    const admin_email = req.body.email;
    const admin_password = req.body.password;

    let response = await Register.findOne({ email: admin_email });
    if (response) {
      const res_password = response.password;
      const cmp = await bcrypt.compare(admin_password, response.password);
      if (cmp) {
        console.log(response._id);
        const userToken = jwt.sign(
          { id: response._id, email: response.email },
          "techzarinfo"
        );
        res.cookie("token", userToken, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
        });
        res
          .setHeader(
            "Set-Cookie",
            "token=true; Max-Age=365 * 24 * 60 * 60 * 1000"
          )
          .setHeader("authorization", "Bearer" + "/" + userToken)
          .status(200)
          .json({
            message: "Your request sent successfully",
            status: 1,
            data: "Bearer" + "/" + userToken,
          });
      } else {
        return res.status(500).json({
          message: "Your password is Incorrect",
          status: 0,
        });
      }
    } else {
      return res.status(200).json({
        message: "Invalid email ",
        status: 0,
      });
    }
  }
);

//Forgot Password
router.post(
  "/forgot-password",
  [check("email", "Email is required").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }

      // Same response whether or not the email exists, so accounts can't be enumerated
      const genericResponse = {
        message: "If that email is registered, a reset link has been sent",
        status: 1,
      };

      const user = await Register.findOne({ email: req.body.email });
      if (!user) {
        return res.status(200).json(genericResponse);
      }

      // Send the raw token by email, store only its hash
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sales@techzarinfo.com",
          pass: "qjmogduymchvbhrt",
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

      try {
        await transporter.sendMail({
          from: "sales@techzarinfo.com",
          to: user.email,
          subject: "Password Reset Request",
          html: `<p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the link below to set a new one:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
        });
      } catch (mailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(500).json({
          message: "Could not send reset email, please try again later",
          status: 0,
        });
      }

      return res.status(200).json(genericResponse);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  }
);

//Reset Password
router.post(
  "/reset-password/:token",
  [
    check("password", "password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await Register.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(200).json({
          message: "Reset link is invalid or has expired",
          status: 0,
        });
      }

      const saltRounds = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, saltRounds);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(200).json({
        message: "Your password has been reset successfully",
        status: 1,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  }
);

//Hire A Developer
router.post(
  "/store-hire-a-developer",
  [
    check("name", "Full Name is required")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Full Name must be at least 6 chars long"),
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("phone", "Phone number is required")
      .not()
      .isEmpty()
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone no. must be 10 digits"),
    check("company", "Company / Organization is required").not().isEmpty(),
    check("message", "Message is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }
      const hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");
      const request = req.body;

      // initialize nodemailer
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sales@techzarinfo.com",
          pass: "qjmogduymchvbhrt",
        },
      });

      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };

      // use a template file with nodemailer
      transporter.use("compile", hbs(handlebarOptions));

      var mailOptions = {
        from: request.email,
        to: "sales@techzarinfo.com",
        bcc: request.email,
        subject: "HIRE A DEVELOPER",
        template: "hire-a-developer", // the name of the template file i.e email.handlebars
        context: {
          name: request.name,
          phone: request.phone,
          email: request.email,
          company: request.company,
          message: request.message,
        },
      };

      // trigger the sending of the E-mail
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          return res.status(200).json({
            message: error.message,
            status: 0,
          });
        } else {
          const hire = new Hire(request);

          let response = await hire.save();

          if (response) {
            return res.status(200).json({
              message: "Your request sent successfully",
              status: 1,
            });
          } else {
            return res.status(200).json({
              message: err.message,
              status: 0,
            });
          }
        }
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        status: 0,
      });
    }
  }
);

//Get Hire A Developer
router.get("/get-hire", verifyToken, async (req, res) => {
  try {
    const data = await Hire.find().sort({ $natural: -1 });
    if (data) {
      return res.json(data);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});

//Delete Hire A Developer
router.get("/delete-hire/:dev_id", verifyToken, async (req, res) => {
  deleteresponse = await Hire.deleteOne({ _id: req.params.dev_id });
  if (deleteresponse) {
    return res.status(500).json({
      status: 1,
      message: "deleted Successfully",
    });
  } else {
    return res.status(500).json({
      status: 0,
      message: "deleted unSuccessfully",
    });
  }
});

//Blog Post
router.post(
  "/store-post",
  verifyToken,
  upload.single("image"),
  [
    check("meta_title", "Meta title is required").not().isEmpty(),
    check("meta_description", "Meta description is required").not().isEmpty(),
    check("keywords", "Keywords is required").not().isEmpty(),
    check("slug", "Slug is required").not().isEmpty(),
    check("title", "title is required")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Title must be at least 6 chars long"),
    check("message", "Message is required").not().isEmpty(),
    check("type", "Type is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (req.file) {
        // Homework: Upload file to S3
        if (!errors.isEmpty()) {
          return res.status(200).json({
            status: 0,
            errors: errors.array(),
          });
        }
        const path = require("path");
        req.body.image = req.file.filename;
        const request = req.body;
        let check_title = await Post.findOne({ title: request.title });
        if (check_title) {
          return res.status(500).json({
            message: "Title Already Exists",
            status: 0,
          });
        } else {
          const post = new Post({
            meta_title: request.meta_title?.toString().toLowerCase(),
            meta_description: request.meta_description?.toString(),
            keywords: request.keywords?.toString().toLowerCase(),
            title: request.title?.toString().toLowerCase(),
            slug: request.slug?.toString().toLowerCase(),
            schema: request.schema,
            image: request.image,
            message: request.message,
            type: request.type,
          });

          let response = await post.save();

          if (response) {
            return res.status(200).json({
              message: "Your post saved successfully",
              status: 1,
            });
          } else {
            return res.status(500).json({
              message: err.message,
              status: 0,
            });
          }
        }
      }
    } catch (err) {
      return res.status(500).json({
        message: err
          ? err.code == 11000
            ? "Title already exists"
            : err.message
          : err.message,
        status: 0,
      });
    }
  }
);
//Edit Post
router.post(
  "/edit-post/:id",
  verifyToken,
  upload.single("image"),
  [
    check("meta_title", "Meta title is required").not().isEmpty(),
    check("meta_description", "Meta description is required").not().isEmpty(),
    check("keywords", "Keywords is required").not().isEmpty(),
    check("slug", "Slug is required").not().isEmpty().trim().custom(value => !/\s/.test(value))
    .withMessage('No spaces are allowed in the slug'),
    check("title", "title is required")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Title must be at least 6 chars long"),
    check("type", "Type is required"),
    check("message", "Message is required").not().isEmpty(),
  ],
  async (req, res) => {
    console.log(req.body)
    try {
      const errors = validationResult(req);
      const check_img = await Post.findOne({ image: req.body.image });
      if (
        check_img?.image == req.body.image &&
        check_img?._id == req.params.id
      ) {
        let response = await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              meta_title: req.body.meta_title?req.body.meta_title.toString().toLowerCase():"",
              meta_description: req.body.meta_description?req.body.meta_description.toString():"",
              keywords: req.body.keywords?req.body.keywords.toString().toLowerCase():"",
              title: req.body.title?req.body.title.toString().toLowerCase(): "",
              slug: req.body.slug?req.body.slug.toString().toLowerCase(): "",
              schema: req.body.schema,
              message: req.body.message,
              type: req.body.type,
            },
          }
        );
        if (response) {
          return res.status(200).json({
            message: "Your post updated successfully",
            status: 1,
          });
        }
      } else {
        if (req.file) {
          // Homework: Upload file to S3
          if (!errors.isEmpty()) {
            return res.status(200).json({
              status: 0,
              errors: errors.array(),
            });
          }
          const path = require("path");
          req.body.image = req.file.filename;
          const request = req.body;
          const upadteimg = await Post.findById(req.params.id);
          if (upadteimg) {
            var imageResponse = upadteimg.image;
            if (imageResponse !== req.body.image) {
              fs.unlink("./public/uploads/" + imageResponse, async (err) => {
                if (!err) {
                  let response = await Post.findOneAndUpdate(
                    { _id: req.params.id },
                    {
                      $set: {
                        meta_title: req.body.meta_title?req.body.meta_title.toString().toLowerCase():"",
                        meta_description: req.body.meta_description?req.body.meta_description.toString().toLowerCase():"",
                        keywords: req.body.keywords?req.body.keywords.toString().toLowerCase():"",
                        title: req.body.title?req.body.title.toString().toLowerCase(): "",
                        slug: req.body.slug?req.body.slug.toString().toLowerCase(): "",
                        schema: req.body.schema,
                        image: req.body.image,
                        message: req.body.message,
                        type: req.body.type,
                      },
                    }
                  );
                  if (response) {
                    return res.status(200).json({
                      message: "Your post updated successfully",
                      status: 1,
                    });
                  } else {
                    return res.status(500).json({
                      message: err.message,
                      status: 0,
                    });
                  }
                }
              });
            } else {
              let response = await Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                  $set: {
                    meta_title: req.body.meta_title?req.body.meta_title.toString().toLowerCase():"",
                    meta_description: req.body.meta_description?req.body.meta_description.toString().toLowerCase():"",
                    keywords: req.body.keywords?req.body.keywords.toString().toLowerCase():"",
                    title: req.body.title,
                    slug: req.body.slug?req.body.slug.toString().toLowerCase():"",
                    schema: req.body.schema,
                    image: req.body.image,
                    message: req.body.message,
                    type: req.body.type,
                  },
                }
              );
              if (response) {
                return res.status(200).json({
                  message: "Your post updated successfully",
                  status: 1,
                });
              } else {
                return res.status(500).json({
                  message: err.message,
                  status: 0,
                });
              }
            }
          }
        }
      }
    } catch (err) {
      return res.status(500).json({
        message: err
          ? err.code == 11000
            ? "Title already exists"
            : err.message
          : err.message,
        status: 0,
      });
    }
  }
);
//Get Post
router.get("/get-post", verifyToken, async (req, res, next) => {
  try {
    const data = await Post.find().sort({ $natural: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/get-post-by-type/:type", async (req, res, next) => {
  try {
    const data =
      req.params.type === "Home"
        ? await Post.find().sort({ $natural: -1 }).limit(4)
        : await Post.find({ type: req.params.type })
            .sort({ $natural: -1 })
            .limit(3);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/get-post/:limit&:page",  async (req, res, next) => {
  try {
    const page = req.params.page;
    const limit = req.params.limit;
    startIndex = (page - 1) * limit;
    endIndex = page * limit;
    const data = await Post.find().sort({ $natural: -1 });
    const sortData = data.slice(startIndex, endIndex);
    return res.status(200).json(sortData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/get-post/:limit/:page/:type", async (req, res, next) => {
  try {
    const limit = Math.max(parseInt(req.params.limit) || 8, 1);
    const page = Math.max(parseInt(req.params.page) || 1, 1);
    const filter = req.params.type === "all" ? {} : { type: req.params.type };
    const data = await Post.find(filter)
      .sort({ $natural: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/get-post/Home", async (req, res, next) => {
  try {
    const data = await Post.find().sort({ $natural: -1 }).limit(3);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Get Post
router.get("/get-post/:post_title", async (req, res) => {
  try {
    let response = await Post.findOne({ slug: req.params.post_title });
    if (response) {
      return res.send(response);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});

router.get("/get-blog/:post_id", async (req, res) => {
  try {
    let response = await Post.findById(req.params.post_id);
    if (response) {
      return res.send(response);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});
//delete Post
router.get("/delete-post/:post_id", verifyToken, async (req, res) => {
  deleteresponse = await Post.deleteOne({ _id: req.params.post_id });
  if (deleteresponse) {
    return res.status(500).json({
      status: 1,
      message: "deleted Successfully",
    });
  } else {
    return res.status(500).json({
      status: 0,
      message: "deleted unSuccessfully",
    });
  }
});

//Career Start

//Career post
router.post(
  "/store-careers",
  verifyToken,
  upload.single("image"),
  [
    check("title", "title is required")
      .not()
      .isEmpty(),
      check("message", "Message is required")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      //   if (req.file) {
      // Homework: Upload file to S3
      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }
      const path = require("path");
      // req?.body?.image = req?.file?.filename;
      const request = req.body;

      const post = new Career(request);

      let response = await post.save();

      if (response) {
        return res.status(200).json({
          message: "Your post saved successfully",
          status: 1,
        });
      } else {
        return res.status(200).json({
          message: err.message,
          status: 0,
        });
      }
      //   }
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        status: 0,
      });
    }
  }
);
//Career get
router.get("/get-careers", async (req, res) => {
  try {
    const data = await Career.find().sort({ $natural: -1 });
    if (data) {
      return res.json(data);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});
//Career get by id
router.get("/get-careers/:id", async (req, res) => {
  try {
    let response = await Career.findById(req.params.id);
    if (response) {
      return res.send(response);
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});
//Career get by id
router.get("/delete-career/:careers_id", verifyToken, async (req, res) => {
  let delresponse = await Career.deleteOne({ _id: req.params.careers_id });
  if (delresponse) {
    return res.status(200).json({
      status: 1,
      message: "deleted Successfully",
    });
  } else {
    return res.status(500).json({
      status: 0,
      message: "deleted unSuccessfully",
    });
  }
});
//Edit Career
router.post(
  "/edit-careers/:id",
  verifyToken,
  upload.single("image"),
  [
    check("title", "title is required")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Title must be at least 6 chars long"),
    check("message", "Message is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      //   if (req.file) {
      // Homework: Upload file to S3
      if (!errors.isEmpty()) {
        return res.status(200).json({
          status: 0,
          errors: errors.array(),
        });
      }
      const path = require("path");
      // req?.body?.image = req?.file?.filename;
      const request = req.body;

      let cresponse = await Career.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { title: req.body.title, message: req.body.message } }
      );
      if (cresponse) {
        return res.status(200).json({
          message: "Your post saved successfully",
          status: 1,
        });
      } else {
        return res.status(200).json({
          message: err.message,
          status: 0,
        });
      }
      //   }
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        status: 0,
      });
    }
  }
);
//Career End

// Dashboard
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const developer = await Hire.count();
    const users = await Register.count();
    const blogs = await Post.count();
    const careers = await Career.count();
    const contact = await Contact.count();
    if (users) {
      return res.json({
        usersCount: users,
        blogsCount: blogs,
        careersCount: careers,
        contactCount: contact,
        developerCount: developer,
      });
    } else {
      return res.status(500).json({
        status: 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: 0,
    });
  }
});
module.exports = router;
