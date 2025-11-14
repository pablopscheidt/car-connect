import { IsInt, IsOptional, IsString } from 'class-validator'
export class ListGarageUsersQueryDto {
  @IsOptional() @IsString() q?: string // busca por nome/email
  @IsOptional() @IsInt() page?: number
  @IsOptional() @IsInt() pageSize?: number
}
