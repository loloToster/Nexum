import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Request } from "express"

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>()
    return Boolean(req.user?.isAdmin)
  }
}
