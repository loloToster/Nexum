import { IsNotEmpty, IsString } from "class-validator"

export default class SocketAuthDto {
  @IsNotEmpty()
  @IsString()
  as: string

  @IsNotEmpty()
  @IsString()
  token: string

  constructor(obj: any) {
    this.as = obj.as
    this.token = obj.token
  }
}
