import { Injectable } from "@nestjs/common"

import { CreateWidgetDto } from "src/dtos/createWidget.dto"
import { WidgetPos } from "src/dtos/widgetPos.dto"
import { WidgetPropDto } from "src/dtos/widgetProp.dto"

import { DatabaseService } from "src/modules/database/database.service"

@Injectable()
export class WidgetService {
  constructor(private db: DatabaseService) {}

  async editPositions(edits: WidgetPos[]) {
    for (const edit of edits) {
      const { widgetId } = edit
      delete edit.widgetId
      await this.db.widget.update({ where: { id: widgetId }, data: edit })
    }
  }

  async editProps(edits: WidgetPropDto[]) {
    for (const edit of edits) {
      const { widgetId } = edit

      delete edit.props.widgetId

      await this.db.widget.update({
        where: { id: widgetId },
        data: {
          customId: edit.customId,
          deviceId: edit.deviceId,
          properties: { upsert: { create: edit.props, update: edit.props } }
        }
      })
    }
  }

  async createWidgets(widgets: CreateWidgetDto[]) {
    const createdIds: number[] = []

    for (const w of widgets) {
      const { properties } = w

      delete w.properties

      const createdWidget = await this.db.widget.create({
        data: {
          ...w,
          properties: { create: properties }
        }
      })

      createdIds.push(createdWidget.id)
    }

    return createdIds
  }

  async deleteWidgets(deleted: number[]) {
    // todo: move this to prisma schema
    await this.db.widgetProperties.deleteMany({
      where: { widgetId: { in: deleted } }
    })
    await this.db.widget.deleteMany({ where: { id: { in: deleted } } })
  }
}
