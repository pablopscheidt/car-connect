import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'

@Controller('v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiCreatedResponse({ description: 'Usuário autenticado com sucesso' })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados do usuário autenticado' })
  me() {
    // req.user vem da JwtStrategy.validate
    return { ok: true }
  }
}
