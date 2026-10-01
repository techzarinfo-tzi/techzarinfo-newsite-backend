// Express 4 doesn't catch rejected promises from async handlers; without this
// a single failed query becomes an unhandled rejection and crashes the process.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
