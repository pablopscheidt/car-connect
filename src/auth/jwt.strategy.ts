import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as passportJwt from 'passport-jwt'
import type { JwtFromRequestFunction } from 'passport-jwt'
import type { AuthUser } from './auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(passportJwt.Strategy) {
  constructor() {
    const jwtFromRequest: JwtFromRequestFunction =
      passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()

    super({
      jwtFromRequest,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
      ignoreExpiration: false,
    })
  }

  // o que retornar aqui vira req.user (tipado)
  validate(payload: AuthUser): AuthUser {
    return payload
  }
}
