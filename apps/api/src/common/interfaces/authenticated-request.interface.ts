import type { Request } from 'express';
import type { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
