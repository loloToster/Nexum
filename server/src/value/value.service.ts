import { Injectable } from "@nestjs/common"
import { Socket } from "socket.io"

import { DatabaseService } from "src/database/database.service"

@Injectable()
export class ValueService {
  constructor(private db: DatabaseService) {}

  async updateValue(
    updater: Socket,
    target: string,
    customId: string,
    deviceId: number,
    value: string | boolean | number
  ) {
    // send update to every user that can read current target
    updater.broadcast.to(target).emit("update-value", { target, value })

    // send update to devices with id from target
    updater.broadcast
      .to(`device-${deviceId}`)
      .emit("update-value", { customId, value })

    // save value in db
    const parsedValue = JSON.stringify(value)

    try {
      await this.db.value.upsert({
        create: {
          customId,
          deviceId,
          value: parsedValue
        },
        update: {
          value: parsedValue
        },
        where: { deviceId_customId: { customId, deviceId } }
      })
    } catch (err) {
      console.error(err)
    }
  }
}
