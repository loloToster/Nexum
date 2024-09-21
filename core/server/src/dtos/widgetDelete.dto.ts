import { IsArray, IsInt, Min } from "class-validator"

export class WidgetsDeleteDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  deleted: number[]
}
