import { IsOptional, IsString, IsBoolean, IsNotEmpty } from "class-validator"

export default class CreateUserDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean
}
