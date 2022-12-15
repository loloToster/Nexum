import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException
} from "@nestjs/common"
import { Observable, catchError } from "rxjs"

import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        if (err instanceof PrismaClientKnownRequestError) {
          throw new NotFoundException()
        } else {
          throw err
        }
      })
    )
  }
}
