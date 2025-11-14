import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import type { AuthUser } from '../auth/auth.types'
import { GarageService } from './garage.service'
import { UpdateGarageDto } from './dto/update-garage.dto'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Garage')
@ApiBearerAuth('JWT-auth')
@Controller('v1/garage')
export class GarageController {
  constructor(private readonly service: GarageService) {}

  @Get('me')
  @Roles('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter dados da garagem do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados da garagem' })
  me(@CurrentUser() user: AuthUser) {
    return this.service.getMyGarage(user.garage.id)
  }

  @Put('me')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @ApiOperation({
    summary: 'Atualizar dados da garagem do usuário autenticado',
  })
  @ApiCreatedResponse({ description: 'Garagem atualizada com sucesso' })
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateGarageDto) {
    return this.service.updateMyGarage(user.garage.id, dto)
  }
}
