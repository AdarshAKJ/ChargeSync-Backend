export class FileTypeIssue extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileTypeIssue';
  }
}

export class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
  }
}