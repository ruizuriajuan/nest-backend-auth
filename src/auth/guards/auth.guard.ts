import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../Interfaces/jwt.payload.interface';
import { AuthService } from '../auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authSrv: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No hay un bearer token');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        { secret: process.env.JWT_SEED }
      );
      console.log({ payload });
      const user = await this.authSrv.findUserById(payload.id);
      console.log({user});
      if(!user) throw new UnauthorizedException('El usuario no existe');
      if(!user.isActive) throw new UnauthorizedException('El usuario no activo');
      request['user'] = user;
    } catch {
      console.log('Error ');
      throw new UnauthorizedException();
    }

    return Promise.resolve(true);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
