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
  UseInterceptors,
  Patch,
  UploadedFiles,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CurrentUser } from '../common/current-user.decorator'
import type { AuthUser } from '../auth/auth.types'
import { VehiclesService } from './vehicles.service'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'
import { VehicleFiltersDto } from './dto/filters.dto'
import { FilesInterceptor } from '@nestjs/platform-express'

import { diskStorage } from 'multer'
import { imageFileFilter, generateFileName } from './upload.util'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@Controller('v1/vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get('admin')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Listar veículos (visão administrativa)' })
  @ApiOkResponse({ description: 'Lista paginada de veículos' })
  listAdmin(
    @CurrentUser() user: AuthUser,
    @Query() filters: VehicleFiltersDto,
  ) {
    return this.service.listAdmin(user.garage.id, filters)
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter dados de um veículo pelo ID' })
  @ApiOkResponse({ description: 'Dados do veículo' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user.garage.id, id)
  }

  @Post()
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Criar um novo veículo' })
  @ApiCreatedResponse({ description: 'Veículo criado com sucesso' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVehicleDto) {
    return this.service.create(user.garage.id, user.sub, dto)
  }

  @Put(':id')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Atualizar dados de um veículo' })
  @ApiCreatedResponse({ description: 'Veículo atualizado com sucesso' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.service.update(user.garage.id, user.sub, id, dto)
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remover um veículo' })
  @ApiOkResponse({ description: 'Veículo removido com sucesso' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.garage.id, id)
  }

  @Post(':id/images')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: generateFileName,
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por arquivo
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Fazer upload de imagens para um veículo' })
  @ApiCreatedResponse({ description: 'Imagens enviadas com sucesso' })
  async uploadImages(
    @CurrentUser() user: AuthUser,
    @Param('id') vehicleId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('coverIndex') coverIndex?: string, // opcional
  ) {
    const coverIdx = coverIndex !== undefined ? Number(coverIndex) : undefined
    const payload = files.map((f, i) => ({
      path: `/uploads/${f.filename}`, // mantém igual ao antigo
      isCover: coverIdx !== undefined ? i === coverIdx : false,
    }))
    return this.service.attachImages(user.garage.id, vehicleId, payload)
  }

  @Patch(':id/images/:imageId/cover')
  @Roles('OWNER', 'ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Definir uma imagem como capa do veículo' })
  @ApiOkResponse({ description: 'Imagem definida como capa com sucesso' })
  setCover(
    @CurrentUser() user: AuthUser,
    @Param('id') vehicleId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.setCover(user.garage.id, vehicleId, imageId)
  }

  @Delete(':id/images/:imageId')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remover uma imagem do veículo' })
  @ApiOkResponse({ description: 'Imagem removida com sucesso' })
  removeImage(
    @CurrentUser() user: AuthUser,
    @Param('id') vehicleId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.removeImage(user.garage.id, vehicleId, imageId)
  }

  @Get(':id/images')
  @Roles('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar imagens de um veículo' })
  @ApiOkResponse({ description: 'Lista de imagens do veículo' })
  listImages(@CurrentUser() user: AuthUser, @Param('id') vehicleId: string) {
    return this.service.listImages(user.garage.id, vehicleId)
  }
}
