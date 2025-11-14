import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

export class UpdateGarageDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(18) // máscara de CNPJ opcional (ou limpe no service)
  doc?: string

  @IsOptional()
  @IsString()
  @MaxLength(20) // ex.: +55 47 9 9999-9999
  phoneWhatsapp?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  addressLine?: string

  @IsOptional()
  @IsString()
  @MaxLength(60)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string

  @IsOptional()
  @IsString()
  @MaxLength(12)
  zip?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  website?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  instagram?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  facebook?: string

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'themePrimaryColor deve ser um hex #RRGGBB',
  })
  themePrimaryColor?: string

  @IsOptional()
  @IsBoolean()
  isPublishEnabled?: boolean
}
