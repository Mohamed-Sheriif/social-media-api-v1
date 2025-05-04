// erros that i can predict
export class ApiError extends Error {
  status: 'fail' | 'error';
  constructor(message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}
