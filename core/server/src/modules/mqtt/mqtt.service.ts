import { Injectable, Logger } from "@nestjs/common"
import { connect, AsyncMqttClient } from "async-mqtt"

import { DatabaseService } from "src/modules/database/database.service"

@Injectable()
export class MqttService {
  client: AsyncMqttClient
  publish: AsyncMqttClient["publish"]

  private readonly logger = new Logger(MqttService.name)

  constructor(private db: DatabaseService) {
    const client = connect(process.env.MQTT_URL || "mqtt://localhost:1883")

    client.on("message", this.onMessage.bind(this))
    client.on("connect", this.onConnect.bind(this))

    this.client = client
    this.publish = client.publish
  }

  private async onMessage(topic: string, payload: Buffer) {
    this.logger.log(`message on topic: ${topic} with payload: ${payload}`)

    const [token, customId, type] = topic.split("/")
    const value = JSON.parse(payload.toString())
  }

  private async onConnect() {
    this.logger.log("connected")

    const allDevices = await this.db.device.findMany()
    const topics = allDevices.map(d => `${d.token}/#`)

    try {
      await this.client.subscribe(topics)
      this.logger.log(`subscribed to ${topics.length} topics`)
    } catch (err) {
      this.logger.error(err instanceof Error ? err.message : err)
    }
  }
}
