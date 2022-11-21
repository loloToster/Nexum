import { IsNotEmpty, IsString, NotEquals } from "class-validator"

export default class EditDto {
  @IsNotEmpty()
  @IsString()
  key: string

  @NotEquals(null)
  @NotEquals(undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}
