import { IsString, IsNotEmpty, Equals, IsIn } from "class-validator"

// ! TODO: hide in error messages
const { GOOGLE_SMARTHOME_CLIENT_ID, GOOGLE_SMARTHOME_PROJECT_ID } = process.env

export class GoogleSmarthomeConnectQueryDto {
  @Equals(GOOGLE_SMARTHOME_CLIENT_ID)
  client_id: string

  @IsIn([
    `https://oauth-redirect.googleusercontent.com/r/${GOOGLE_SMARTHOME_PROJECT_ID}`,
    `https://oauth-redirect-sandbox.googleusercontent.com/r/${GOOGLE_SMARTHOME_PROJECT_ID}`
  ])
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
