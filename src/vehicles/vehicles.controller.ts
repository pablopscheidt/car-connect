import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import type { AuthUser } from '../auth/auth.types'
import { VehiclesService } from './vehicles.service'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('v1/vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get('admin')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  listAdmin() {
    return { ok: true }
  }

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return this.service.list(user.garage.id)
  }
}
