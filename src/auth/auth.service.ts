import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return null
    return user
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password)
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    // escolhe a garagem ativa (por slug, ou a primeira)
    const rels = await this.prisma.garageUser.findMany({
      where: { userId: user.id },
      include: { garage: true },
    })
    if (!rels.length)
      throw new UnauthorizedException('Usuário sem garagem vinculada')

    const active = rels[0]

    const payload = {
      sub: user.id,
      email: user.email,
      garage: { id: active.garageId, role: active.role },
    }
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '8h',
      secret: process.env.JWT_SECRET || 'dev-secret',
    })

    return {
      access_token,
      user: { id: user.id, email: user.email, name: user.name },
      activeGarage: {
        id: active.garageId,
        slug: active.garage.slug,
        role: active.role,
      },
    }
  }
}
