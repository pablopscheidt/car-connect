import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator'

export class PublicVehicleFiltersDto {
  @IsOptional() @IsString() q?: string
  @IsOptional() @IsString() brand?: string
  @IsOptional() @IsString() model?: string
  @IsOptional() @IsNumberString() minPrice?: string
  @IsOptional() @IsNumberString() maxPrice?: string
  @IsOptional() @IsInt() year?: number

  @IsOptional() @IsInt() page?: number
  @IsOptional() @IsInt() pageSize?: number
}
