import { Tab, User } from "@prisma/client"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export interface UserWithTabs extends User {
  tabs: Tab[]
}
