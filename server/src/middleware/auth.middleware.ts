import { Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"

import { DatabaseService } from "src/database/database.service"

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private db: DatabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization?.toLowerCase()

    if (authHeader && authHeader.startsWith("bearer ")) {
      const token = authHeader.replace("bearer", "").trim()

      try {
        req.user = await this.db.user.findUnique({
          where: { id: token }
        })
      } catch (err) {
        console.error(err)
      }
    }

    next()
  }
}
