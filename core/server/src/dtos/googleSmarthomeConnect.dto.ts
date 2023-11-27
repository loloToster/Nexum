import { IsString, IsNotEmpty } from "class-validator"

export class GoogleSmarthomeConnectQueryDto {
  @IsString()
  @IsNotEmpty()
  client_id: string

  @IsString()
  @IsNotEmpty()
  redirect_uri: string

  @IsString()
  @IsNotEmpty()
  state: string
}

export class GoogleSmarthomeConnectBodyDto {
  @IsString()
  @IsNotEmpty()
  token: string
}
