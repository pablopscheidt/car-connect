import { Controller, Get, Param, Query } from '@nestjs/common'
import { PublicService } from './public.service'
import { PublicVehicleFiltersDto } from './dto/public-vehicle-filters.dto'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Public')
@Controller('v1/public/:garageSlug')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('garage')
  @ApiOperation({ summary: 'Dados públicos da garagem' })
  garage(@Param('garageSlug') slug: string) {
    return this.service.getGaragePublic(slug)
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Listar veículos públicos (IN_STOCK)' })
  list(@Param('garageSlug') slug: string, @Query() q: PublicVehicleFiltersDto) {
    return this.service.listVehicles(slug, q)
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Detalhe de veículo público' })
  get(@Param('garageSlug') slug: string, @Param('id') id: string) {
    return this.service.getVehicle(slug, id)
  }
}
