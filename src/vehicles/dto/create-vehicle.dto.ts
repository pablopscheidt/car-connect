import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateVehicleDto {
  @IsString() brand!: string
  @IsString() model!: string
  @IsOptional() @IsString() version?: string

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearFabrication!: number
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  yearModel!: number

  @IsEnum(['GASOLINA', 'ALCOOL', 'FLEX', 'DIESEL', 'HIBRIDO', 'ELETRICO'])
  fuel!: 'GASOLINA' | 'ALCOOL' | 'FLEX' | 'DIESEL' | 'HIBRIDO' | 'ELETRICO'

  @IsEnum(['MANUAL', 'AUTOMATICO', 'CVT'])
  gearbox!: 'MANUAL' | 'AUTOMATICO' | 'CVT'

  @IsOptional() @IsString() color?: string

  @IsBoolean() priceOnRequest!: boolean
  @IsOptional() @Type(() => Number) @IsNumber() price?: number // Decimal em Prisma; aqui validamos número

  @IsEnum(['IN_STOCK', 'RESERVED', 'SOLD'])
  status!: 'IN_STOCK' | 'RESERVED' | 'SOLD'

  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() renavam?: string
}
