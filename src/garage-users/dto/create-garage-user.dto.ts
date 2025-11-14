import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator'
export class CreateGarageUserDto {
  @IsEmail() email!: string
  @IsString() @MinLength(2) name!: string
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string // opcional (pode usar convite no futuro)
  @IsIn(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'])
  role!: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
}
