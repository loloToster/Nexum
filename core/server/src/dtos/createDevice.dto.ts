import { IsOptional, IsString, IsNotEmpty } from "class-validator"

export default class CreateDeviceDto {
  @IsOptional()
  @IsString()
  token?: string

  @IsString()
  @IsNotEmpty()
  name: string
}
