import { ErrorStatus } from './errorStatus';

export class ErrorStatus404 extends ErrorStatus {
  constructor(message: string) {
    super(message, 404);
  }
}
