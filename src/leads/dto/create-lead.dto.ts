import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string

  @IsOptional()
  @IsString()
  vehicleId?: string

  @IsBoolean()
  consentLgpd!: boolean
}
