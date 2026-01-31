class ApiResponse {
  constructor(statusCode, data, message = 'Success', successStatus=true) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.success = successStatus;
  }
}

export { ApiResponse };
