import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token');
    }

    const idToken = authHeader.substring(7);

    try {
  const decoded = await admin.auth().verifyIdToken(idToken);

  // firebase token 정보
  req.firebaseUid = decoded.uid;
  req.firebaseToken = decoded;

  return true;
} catch (e) {
  console.error("verifyIdToken error", e);
  throw new UnauthorizedException('Invalid token');
}
  }
}