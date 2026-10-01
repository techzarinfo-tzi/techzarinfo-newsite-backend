# Techzarinfo API

Express + MongoDB API for the Techzarinfo website: contact / hire-a-developer
enquiries, blog posts, careers and the admin panel.

## Setup

Requires Node.js 20+ and MongoDB.

```sh
npm install
cp .env.example .env   # then fill in the values
npm run dev            # development (auto-restart)
npm start              # production
```

The server refuses to start if `MONGO_URI`, `JWT_SECRET`, `MAIL_USER` or
`MAIL_PASS` is missing.

## Structure

```
index.js                 entry point: connects to MongoDB, starts the server
src/
  app.js                 Express app: security headers, CORS, parsers, static files, routes
  config/                environment config and database connection
  routes/                URL -> middleware -> controller wiring
  controllers/           request handlers
  models/                Mongoose schemas
  validators/            express-validator rules per resource
  middleware/            auth (JWT), uploads, validation, rate limits, error handling
  services/              email sending
  views/emails/          Handlebars email templates
  utils/
public/uploads/          uploaded blog images (not in git)
```

## Admin accounts

`POST /store-register` is open only while there are no users, so the first
admin can be created. After that, creating an account requires a signed-in
admin's token.
