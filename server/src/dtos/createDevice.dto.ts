import { IsOptional, IsString, IsNotEmpty } from "class-validator"

export default class CreateDeviceDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name: string
}
