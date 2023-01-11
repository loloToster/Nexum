import { IsNotEmpty, IsString } from "class-validator"

export default class LoginDto {
  @IsNotEmpty()
  @IsString()
  token: string
}
