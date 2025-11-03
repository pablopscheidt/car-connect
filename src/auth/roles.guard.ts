import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import type { AuthUser } from './auth.types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required?.length) return true

    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>()
    const user = req.user
    const userRole = user?.garage?.role

    // nega se não houver role no payload
    if (!userRole) return false

    return required.includes(userRole)
  }
}
