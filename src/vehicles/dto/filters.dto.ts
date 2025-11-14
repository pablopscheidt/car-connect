import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'

export class VehicleFiltersDto {
  @IsOptional() @IsString() q?: string // busca texto
  @IsOptional() @IsString() brand?: string
  @IsOptional() @IsString() model?: string
  @IsOptional() @IsNumberString() minPrice?: string
  @IsOptional() @IsNumberString() maxPrice?: string
  @IsOptional() @IsInt() year?: number
  @IsOptional()
  @IsEnum(['IN_STOCK', 'RESERVED', 'SOLD'])
  status?: 'IN_STOCK' | 'RESERVED' | 'SOLD'

  @IsOptional() @IsInt() page?: number
  @IsOptional() @IsInt() pageSize?: number
}
