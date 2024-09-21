import { WidgetProperties } from "@prisma/client"
import { IsInt, IsString, MaxLength, Min, NotEquals } from "class-validator"

export class WidgetPropDto {
  @IsInt()
  @Min(0)
  widgetId: number

  @IsString()
  @MaxLength(128)
  customId: string

  @IsInt()
  @Min(0)
  deviceId: number

  // todo: validate
  @NotEquals("") // temp
  props: Partial<WidgetProperties>
}
