import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator"

const grantTypes = ["authorization_code", "refresh_token"] as const

export default class GoogleSmarthomeTokenReqDto {
  @IsString()
  @IsNotEmpty()
  client_id: string

  @IsString()
  @IsNotEmpty()
  client_secret: string

  @IsIn(grantTypes)
  grant_type: typeof grantTypes[number]

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  refresh_token?: string
}
