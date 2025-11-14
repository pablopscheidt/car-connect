import { IsInt, IsOptional, IsString } from 'class-validator'

export class ListLeadsQueryDto {
  @IsOptional()
  @IsString()
  q?: string // busca por nome/telefone/email

  @IsOptional()
  @IsInt()
  page?: number

  @IsOptional()
  @IsInt()
  pageSize?: number
}
