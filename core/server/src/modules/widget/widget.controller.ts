import { Body, Controller, Patch, UseGuards } from "@nestjs/common"

import { WidgetService } from "./widget.service"

import { IsAdminGuard } from "src/guards/isadmin.guard"

import { WidgetsPosDto } from "src/dtos/widgetPos.dto"
import { WidgetsEditDto } from "src/dtos/widgetsEdit.dto"

@Controller("/api/widgets")
@UseGuards(IsAdminGuard)
export class WidgetController {
  constructor(private widgetService: WidgetService) {}

  @Patch("/pos")
  async editWidgetsPos(@Body() { edits }: WidgetsPosDto) {
    return this.widgetService.editPositions(edits)
  }

  @Patch("/prop")
  async editWidgetsProp(@Body() { edits, created, deleted }: WidgetsEditDto) {
    return Promise.all([
      this.widgetService.editProps(edits),
      this.widgetService.createWidgets(created),
      this.widgetService.deleteWidgets(deleted)
    ])
  }
}
