import { Type } from "class-transformer"
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ValidateNested
} from "class-validator"

export class GoogleSmarthomeTraitTargetDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(0)
  deviceId: number

  @IsString()
  customId: string
}

export class GoogleSmarthomeDeviceTraitDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoogleSmarthomeTraitTargetDto)
  targets: GoogleSmarthomeTraitTargetDto[]
}

export class NewGoogleSmarthomeDeviceDto {
  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  name: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoogleSmarthomeDeviceTraitDto)
  traits: GoogleSmarthomeDeviceTraitDto[]
}

export class EditGoogleSmarthomeDeviceDto extends NewGoogleSmarthomeDeviceDto {
  @IsInt()
  @Min(0)
  id: number
}
