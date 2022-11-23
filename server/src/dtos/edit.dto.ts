import { IsNotEmpty, IsString, NotEquals } from "class-validator"

export default class EditDto {
  @IsNotEmpty()
  @IsString()
  key: string

  @NotEquals(null)
  @NotEquals(undefined)
  value: any
}
