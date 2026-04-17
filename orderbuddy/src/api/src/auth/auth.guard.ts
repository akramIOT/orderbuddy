import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { getSession, VerifySessionOptions } from 'supertokens-node/recipe/session';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(UsersService) private userService: UsersService) {}
  private readonly logger = new Logger(AuthGuard.name);

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const ctx = context.switchToHttp();

      const req = ctx.getRequest();
      const resp = ctx.getResponse();

      // If the session doesn't exist and {sessionRequired: true} is passed to the AuthGuard constructor (default is true),
      // getSession will throw an error, that will be handled by the exception filter, returning a 401 response.

      // To avoid an error when the session doesn't exist, pass {sessionRequired: false} to the AuthGuard constructor.
      // In this case, req.session will be undefined if the session doesn't exist.
      const session = await getSession(req, resp, {});
      req.session = session;
      this.logger.debug('AuthGuard session.getUserId: ' + session.getUserId());

      const user = await this.userService.getUser(session.getUserId());
      if (!user) {
        this.logger.error('User does not exist');
        return false;
      }

      this.logger.debug('AuthGuard User: ' + user.userId);

      return true;
    } catch (error) {
      this.logger.error('AuthGuard: ' + error);
      return false;
    }
  }
}
