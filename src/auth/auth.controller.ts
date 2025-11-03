import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('v1/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me() {
    // req.user vem da JwtStrategy.validate
    return { ok: true }
  }
}
