import { Equals, IsIn, IsOptional, IsString } from "class-validator"

const { GOOGLE_SMARTHOME_CLIENT_ID, GOOGLE_SMARTHOME_CLIENT_SECRET } =
  process.env

const grantTypes = ["authorization_code", "refresh_token"] as const

export default class GoogleSmarthomeTokenReqDto {
  @Equals(GOOGLE_SMARTHOME_CLIENT_ID)
  client_id: string

  @Equals(GOOGLE_SMARTHOME_CLIENT_SECRET)
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
