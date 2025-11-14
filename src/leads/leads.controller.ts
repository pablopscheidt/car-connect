import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { LeadsService } from './leads.service'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../common/current-user.decorator'
import type { AuthUser } from '../auth/auth.types'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Leads')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('v1/leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar leads da garagem autenticada' })
  list(@CurrentUser() user: AuthUser, @Query() q: ListLeadsQueryDto) {
    return this.service.listForGarage(user.garage.id, q)
  }
}
