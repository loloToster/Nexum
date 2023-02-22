import { Injectable } from "@nestjs/common"
import { WidgetPos } from "src/dtos/widgetPos.dto"

import { DatabaseService } from "src/modules/database/database.service"

@Injectable()
export class WidgetService {
  constructor(private db: DatabaseService) {}

  async editPostions(edits: WidgetPos[]) {
    for (const edit of edits) {
      const { widgetId } = edit
      delete edit.widgetId
      await this.db.widget.update({ where: { id: widgetId }, data: edit })
    }
  }
}
