// An error whose message is safe to send to the client.
export default class ApiError extends Error {
  constructor(httpStatus, message) {
    super(message);
    this.httpStatus = httpStatus;
  }
}
