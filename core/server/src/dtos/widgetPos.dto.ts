import { Type } from "class-transformer"
import {
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  IsOptional
} from "class-validator"

export class WidgetPos {
  @IsInt()
  @Min(0)
  widgetId: number

  @IsInt()
  @Min(0)
  @IsOptional()
  x?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  y?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  width?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  height?: number
}

export class WidgetsPosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetPos)
  edits: WidgetPos[]
}
