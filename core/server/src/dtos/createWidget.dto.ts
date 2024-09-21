import { IsInt, IsString, MaxLength, Min, NotEquals } from "class-validator"
import { WidgetProperties } from "@prisma/client"

export class CreateWidgetDto {
  @IsString()
  @MaxLength(128)
  type: string

  @IsInt()
  @Min(0)
  tabId: number

  @IsInt()
  @Min(0)
  x: number

  @IsInt()
  @Min(0)
  y: number

  @IsInt()
  @Min(0)
  width: number

  @IsInt()
  @Min(0)
  height: number

  @IsString()
  @MaxLength(128)
  customId: string

  @IsInt()
  @Min(0)
  deviceId: number

  // todo: validate
  @NotEquals("") // temp
  properties?: Partial<WidgetProperties>
}
