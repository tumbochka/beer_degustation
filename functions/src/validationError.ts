export class ValidationError extends Error {
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    Object.setPrototypeOf(this, trueProto);
  }
}
