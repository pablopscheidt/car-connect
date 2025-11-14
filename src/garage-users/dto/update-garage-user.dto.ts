import { IsIn, IsOptional, IsString, MinLength } from 'class-validator'
export class UpdateGarageUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string
  @IsOptional()
  @IsIn(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'])
  role?: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
}
