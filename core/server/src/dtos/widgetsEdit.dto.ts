import { Type } from "class-transformer"
import { IsArray, ValidateNested } from "class-validator"

import { WidgetPropDto } from "./widgetProp.dto"
import { WidgetsDeleteDto } from "./widgetDelete.dto"
import { CreateWidgetDto } from "./createWidget.dto"

export class WidgetsEditDto extends WidgetsDeleteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetPropDto)
  edits: WidgetPropDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWidgetDto)
  created: CreateWidgetDto[]

  // deleted: ... from inheritance
}
