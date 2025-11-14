import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import type { AuthUser } from '../auth/auth.types'
import { GarageUsersService } from './garage-users.service'
import { CreateGarageUserDto } from './dto/create-garage-user.dto'
import { UpdateGarageUserDto } from './dto/update-garage-user.dto'
import { ListGarageUsersQueryDto } from './dto/list-query.dto'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Garage Users')
@ApiBearerAuth('JWT-auth')
@Controller('v1/garage/users')
export class GarageUsersController {
  constructor(private readonly service: GarageUsersService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar usuários vinculados à garagem' })
  @ApiOkResponse({ description: 'Lista paginada de usuários' })
  list(@CurrentUser() user: AuthUser, @Query() q: ListGarageUsersQueryDto) {
    return this.service.list(user.garage.id, q)
  }

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Vincular/criar usuário na garagem' })
  @ApiCreatedResponse({ description: 'Usuário vinculado com sucesso' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGarageUserDto) {
    return this.service.create(user.garage.id, user.sub, dto)
  }

  @Put(':userId')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Atualizar dados/role de um usuário' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateGarageUserDto,
  ) {
    return this.service.update(user.garage.id, user.sub, userId, dto)
  }

  @Delete(':userId')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remover vínculo do usuário com a garagem' })
  remove(@CurrentUser() user: AuthUser, @Param('userId') userId: string) {
    return this.service.remove(user.garage.id, user.sub, userId)
  }
}
