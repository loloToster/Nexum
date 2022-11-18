import { IsNotEmpty, IsString } from "class-validator"

export default class RemoveUserDto {
  @IsNotEmpty()
  @IsString()
  id: string
}
