import { IsString, IsNotEmpty } from "class-validator"

export default class CreateTabDto {
  @IsString()
  @IsNotEmpty()
  name: string
}
